import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, AlertCircle, FileText, ChefHat, UtensilsCrossed, Info, X, ChevronDown, FileEdit
} from 'lucide-react';
import { getTodayOrders, getOrders, getChefDailyNote, enrichOrdersWithPatientAllergies } from '../../services/orderService';
import { hasRealAllergy } from '../../utils/orderTransformer';
import { getMenuItemsByCycle } from '../../services/menuService';
import Button from '../../components/ui/buttons/Button';
import ChefNoteSynthesizerModal from '../../components/ui/modals/ChefNoteSynthesizerModal';
import PageTransition from '../../components/PageTransition';

// Konversi objek tanggal ke format string YYYY-MM-DD
const toDateInputString = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Halaman rekapitulasi produksi dapur untuk koki (agregasi porsi per lauk & catatan diet pasien)
export default function Chef() {
  const [rawOrders, setRawOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateMode, setSelectedDateMode] = useState('tomorrow'); // 'today' | 'tomorrow'
  const [selectedMealTime, setSelectedMealTime] = useState('Semua');
  const [chefDailyNote, setChefDailyNote] = useState('');
  const [isChefNoteModalOpen, setIsChefNoteModalOpen] = useState(false);

  // Tanggal Hari Ini (T) dan Esok Hari (T+1)
  const todayObj = useMemo(() => new Date(currentDate), [currentDate]);
  const tomorrowObj = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    return d;
  }, [currentDate]);

  // Tanggal penyajian aktif yang dipilih (Hari Ini atau Besok)
  const activeServingDateObj = useMemo(() => {
    return selectedDateMode === 'today' ? todayObj : tomorrowObj;
  }, [selectedDateMode, todayObj, tomorrowObj]);

  const activeServingDateStr = useMemo(() => toDateInputString(activeServingDateObj), [activeServingDateObj]);

  // Nomor siklus menu berjalan (1 s.d. 11) berdasarkan tanggal aktif
  const cycleNumber = useMemo(() => {
    const day = activeServingDateObj.getDate();
    let num = day % 10;
    if (num === 0) num = 10;
    if (day === 31) num = 11;
    return num;
  }, [activeServingDateObj]);

  // Ambil data pesanan aktif dari sistem RS via endpoint cepat getTodayOrders()
  const fetchChefData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let ordersData = [];
      try {
        ordersData = await getTodayOrders();
      } catch (e) {
        console.warn('Gagal getTodayOrders di Chef, fallback ke getOrders:', e.message);
        ordersData = await getOrders();
      }
      if (!ordersData || ordersData.length === 0) {
        ordersData = await getOrders();
      }
      setRawOrders(ordersData || []);

      // Langkah background: Perkaya data pesanan dengan riwayat alergi pasien di latar belakang
      if (ordersData && ordersData.length > 0) {
        enrichOrdersWithPatientAllergies(ordersData)
          .then((enriched) => {
            if (Array.isArray(enriched)) {
              setRawOrders(enriched);
            }
          })
          .catch((enrichErr) => {
            console.warn('Gagal memuat riwayat alergi pasien di Chef:', enrichErr);
          });
      }

      // Ambil catatan koki rangkuman tim gizi KHUSUS untuk tanggal penyajian aktif
      try {
        const noteRes = await getChefDailyNote(activeServingDateStr);
        if (noteRes && noteRes.note) {
          setChefDailyNote(noteRes.note);
        } else {
          setChefDailyNote('');
        }
      } catch (noteErr) {
        console.warn('Gagal memuat catatan koki di Chef.jsx:', noteErr);
      }
    } catch (err) {
      console.error('Failed to fetch chef data:', err);
      setError(err.message || 'Gagal mengambil data pesanan.');
    } finally {
      setLoading(false);
    }
  }, [activeServingDateStr]);

  // Ambil komponen master menu berdasarkan siklus menu aktif
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const items = await getMenuItemsByCycle(cycleNumber);
        setMenuItems(items || []);
      } catch (err) {
        console.error('Failed to fetch menus:', err);
      }
    };
    fetchMenus();
  }, [cycleNumber]);

  useEffect(() => {
    fetchChefData();

    // Polling setiap 30 detik untuk sinkronisasi data pesanan dari sistem RS
    const interval = setInterval(() => {
      fetchChefData();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchChefData]);

  // Sinkronisasi instan jika ada update catatan koki dari modal rangkuman gizi untuk tanggal aktif
  useEffect(() => {
    const handleNoteUpdated = (e) => {
      if (e.detail?.note !== undefined) {
        if (!e.detail.dateNorm || e.detail.dateNorm === activeServingDateStr) {
          setChefDailyNote(e.detail.note);
        }
      }
    };
    window.addEventListener('chef-daily-note-updated', handleNoteUpdated);
    return () => {
      window.removeEventListener('chef-daily-note-updated', handleNoteUpdated);
    };
  }, [activeServingDateStr]);

  // Filter pesanan khusus untuk jadwal produksi tanggal penyajian aktif (Hari Ini atau Besok)
  const filteredDailyOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const dateVal = order.servingDate || order.createdAt;
      if (!dateVal) return false;
      const d = new Date(dateVal);
      const localStr = !isNaN(d.getTime()) ? toDateInputString(d) : '';
      const isoPrefix = typeof dateVal === 'string' ? dateVal.slice(0, 10) : '';
      return localStr === activeServingDateStr || isoPrefix === activeServingDateStr;
    });
  }, [rawOrders, activeServingDateStr]);

  // Agregasi jumlah porsi per bahan/komponen lauk dan catatan khusus diet pasien
  const chefStats = useMemo(() => {
    const overallStats = {
      Karbohidrat: {}, 
      'Protein Hewani': {}, 
      Sayur: {}, 
      'Protein Nabati': {}, 
      'Protein Tambahan': {}, 
      notes: []
    };
    const patientNotesMap = new Map();

    filteredDailyOrders.forEach(order => {
      const qty = order.quantity || 1;
      let meal = (order.mealTime || '').toUpperCase();
      if (meal === 'MALAM') meal = 'SORE';

      if (selectedMealTime !== 'Semua' && meal !== selectedMealTime) {
        return;
      }

      const orderMeal = meal;
      const orderPaket = (order.paketName || '').trim().toLowerCase();
      const orderMenu = (order.menuName || '').trim().toLowerCase();
      const paket = (order.paketName || order.menuName || '').trim();
      
      // Cari hidangan master menu yang cocok untuk mengekstrak komponen bahan baku
      const matchedMenu = menuItems.find(m => {
        const mMeal = (m.mealTime || '').toUpperCase();
        if (mMeal !== orderMeal) return false;
        const mPaket = (m.paketName || '').trim().toLowerCase();
        const mName = (m.name || '').trim().toLowerCase();
        return (
          (orderPaket && mPaket === orderPaket) ||
          (orderMenu && (mName === orderMenu || mPaket === orderMenu)) ||
          (orderPaket && mName === orderPaket) ||
          (paket && (mPaket === paket.toLowerCase() || mName === paket.toLowerCase()))
        );
      });

      // Ambil nilai komponen bahan dari data pesanan atau master menu siklus
      const getInitialComponent = (matchedVal, orderVal) => {
        if (orderVal && typeof orderVal === 'string' && orderVal.trim() !== '' && orderVal.trim() !== '-') {
          return orderVal.trim();
        }
        if (matchedVal && typeof matchedVal === 'string' && matchedVal.trim() !== '' && matchedVal.trim() !== '-') {
          return matchedVal.trim();
        }
        return '';
      };

      let karbo = getInitialComponent(matchedMenu?.karbohidrat, order.karbohidrat);
      let protein = getInitialComponent(matchedMenu?.protein, order.protein);
      let sayur = getInitialComponent(matchedMenu?.sayur, order.sayur);
      let nabati = getInitialComponent(matchedMenu?.nabati, order.nabati);
      let tambahan = getInitialComponent(
        matchedMenu?.proteinTambahan || matchedMenu?.protein_tambahan,
        order.proteinTambahan || order.protein_tambahan
      );

      const existingNotes = order.notes || '';
      if (existingNotes) {
        // Sesuaikan komponen lauk berdasarkan modifikasi catatan pesanan ([Tanpa ...] atau [Ganti ...])
        const parseNote = (label, currentVal) => {
          if (existingNotes.includes(`[Tanpa ${label}]`)) return '';
          const match = existingNotes.match(new RegExp(`\\[Ganti ${label}: (.*?)\\]`));
          if (match) {
            const val = match[1].trim();
            return val && val !== '-' ? val : '';
          }
          return currentVal;
        };

        karbo = parseNote('Karbohidrat', karbo);
        protein = parseNote('Protein Hewani', protein);
        sayur = parseNote('Sayur', sayur);
        nabati = parseNote('Protein Nabati', nabati);
        tambahan = parseNote('Protein Tambahan', tambahan);
      }

      // Tambahkan jumlah porsi ke kategori bahan terkait
      const addStat = (category, value) => {
        if (!value || typeof value !== 'string') return;
        const trimmed = value.trim();
        if (trimmed && trimmed !== '-') {
          overallStats[category][trimmed] = (overallStats[category][trimmed] || 0) + qty;
        }
      };

      const isPaket = Boolean(
        order.paketName || 
        (order.menuName && /paket/i.test(order.menuName)) ||
        matchedMenu
      );
      const hasNamedComponent = [karbo, protein, sayur, nabati, tambahan].some(val => val && val.trim() !== '' && val !== '-');

      if (isPaket || hasNamedComponent) {
        addStat('Karbohidrat', karbo);
        addStat('Protein Hewani', protein);
        addStat('Sayur', sayur);
        addStat('Protein Nabati', nabati);
        addStat('Protein Tambahan', tambahan);
      } else {
        const fallbackName = order.menuName || order.paketName || '';
        addStat('Karbohidrat', fallbackName);
      }

      // Rekap catatan khusus pesanan per pasien (filter 1 catatan per pasien)
      const hasNote = order.notes && typeof order.notes === 'string' && order.notes.trim() !== '' && order.notes.trim() !== '-';
      const allergyRaw = order.patient?.allergies || order.allergies || order.allergyNote || null;
      const isAllergic = typeof order.hasAllergy === 'boolean' ? order.hasAllergy : hasRealAllergy(allergyRaw);

      if (hasNote) {
        const patientName = order.patientName || order.patient?.name || order.consumer_name || 'Pasien';
        const room = (order.roomNumber ? `${order.roomNumber} - ${order.classType || ''}` : (order.kamar || '-')).replace(/\s*\|\s*$/, '');
        const patientId = order.patientId || order.rmNumber || '-';
        const patientKey = String(patientId && patientId !== '-' ? patientId : `${patientName}_${room}`).trim().toLowerCase();

        if (!patientNotesMap.has(patientKey)) {
          patientNotesMap.set(patientKey, {
            patientName,
            room,
            note: order.notes.trim(),
            allergy: isAllergic ? allergyRaw : '',
            menu: order.menuName || order.paketName,
            mealTime: meal
          });
        } else {
          const existing = patientNotesMap.get(patientKey);
          if (!existing.note && hasNote) existing.note = order.notes.trim();
          if (!existing.allergy && allergyRaw) existing.allergy = allergyRaw;
        }
      }
    });

    overallStats.notes = Array.from(patientNotesMap.values());
    return overallStats;
  }, [filteredDailyOrders, menuItems, selectedMealTime]);

  // Urutkan rincian per bahan dari porsi terbanyak ke terkecil
  const sortEntries = (entries) => {
    return [...entries].sort((a, b) => b[1] - a[1]);
  };

  const karboEntries = sortEntries(Object.entries(chefStats['Karbohidrat']));
  const hewaniEntries = sortEntries(Object.entries(chefStats['Protein Hewani']));
  const sayurEntries = sortEntries(Object.entries(chefStats['Sayur']));
  const nabatiEntries = sortEntries(Object.entries(chefStats['Protein Nabati']));
  const tambahanEntries = sortEntries(Object.entries(chefStats['Protein Tambahan']));

  const maxRows = Math.max(
    karboEntries.length,
    hewaniEntries.length,
    sayurEntries.length,
    nabatiEntries.length,
    tambahanEntries.length
  );

  // Susun baris tabel 5 kolom bahan baku secara seragam
  const tableRows = Array.from({ length: maxRows }).map((_, i) => ({
    karbo: karboEntries[i] || null,
    hewani: hewaniEntries[i] || null,
    sayur: sayurEntries[i] || null,
    nabati: nabatiEntries[i] || null,
    tambahan: tambahanEntries[i] || null,
  }));



  const hasAnyData = maxRows > 0;

  // Format tanggal penyajian ke teks formal bahasa Indonesia
  const formatServingDateDisplay = (d) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <PageTransition>
      <div className="space-y-6 w-full pb-10">
        {/* Header judul rekap produksi, siklus menu, dan tanggal penyajian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary-600" />
              Rekapitulasi Produksi Dapur
            </h1>
            <p className="text-sm text-neutral-500 mt-1 mb-3">
              {selectedMealTime === 'Semua' 
                ? 'Ringkasan total bahan dan porsi secara keseluruhan (Pagi, Siang, Sore & Ekstra).'
                : `Ringkasan total bahan dan porsi khusus untuk waktu Makan ${selectedMealTime.charAt(0) + selectedMealTime.slice(1).toLowerCase()}.`}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle Hari Ini vs Besok (T+1) */}
            <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5">
              <button
                type="button"
                onClick={() => setSelectedDateMode('today')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedDateMode === 'today'
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setSelectedDateMode('tomorrow')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedDateMode === 'tomorrow'
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Besok (T+1)
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>
              Siklus Hari {cycleNumber}
            </span>
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 flex flex-col items-end">
              <span className="text-[10px] text-neutral-500 leading-none">
                {selectedDateMode === 'today' ? 'Penyajian Hari Ini (T)' : 'Penyajian Besok (T+1)'}
              </span>
              <span>{formatServingDateDisplay(activeServingDateObj)}</span>
            </div>
            <button
              type="button"
              onClick={fetchChefData}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer border-none outline-none ring-0 shadow-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 p-3 rounded-lg flex items-center gap-2 text-sm text-danger-700">
            <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && rawOrders.length === 0 ? (
          <div className="w-full bg-white rounded-xl border border-neutral-200 p-12 text-center text-sm text-neutral-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
            <span>Memuat total produksi dapur...</span>
          </div>
        ) : (
          <div className="space-y-6">
            


            {/* Filter Section */}
            <div className="flex pb-2">
              <div className="relative w-44">
                <select
                  value={selectedMealTime}
                  onChange={(e) => setSelectedMealTime(e.target.value)}
                  className="w-full h-10 appearance-none bg-white border border-neutral-300 rounded-xl px-3.5 pr-9 text-xs sm:text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-xs cursor-pointer"
                >
                  <option value="Semua">Semua Waktu</option>
                  <option value="PAGI">Makan Pagi</option>
                  <option value="SIANG">Makan Siang</option>
                  <option value="SORE">Makan Sore</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {!hasAnyData ? (
              <div className="w-full bg-white rounded-xl border border-neutral-200 p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3">
                <UtensilsCrossed className="w-12 h-12 text-neutral-300 mb-2" />
                <h3 className="text-lg font-bold text-neutral-700">Belum Ada Data Produksi</h3>
                <p className="text-sm text-neutral-500 max-w-sm">
                  {selectedMealTime === 'Semua' 
                    ? 'Belum ada pesanan yang terdaftar untuk jadwal penyajian besok hari.'
                    : `Belum ada pesanan untuk waktu Makan ${selectedMealTime.charAt(0) + selectedMealTime.slice(1).toLowerCase()} besok hari.`}
                </p>
              </div>
            ) : (
            <div className="bg-white mb-8 overflow-hidden" style={{ border: '1px solid #9ca3af' }}>
              {/* Unified 5-Column Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-primary-50">
                    {/* Baris Kategori Utama (Colspan 2) */}
                    <tr>
                      <th colSpan="2" className="px-3 py-3 text-sm font-bold text-neutral-900 text-center w-1/5" style={{ border: '1px solid #9ca3af' }}>Karbohidrat</th>
                      <th colSpan="2" className="px-3 py-3 text-sm font-bold text-neutral-900 text-center w-1/5" style={{ border: '1px solid #9ca3af' }}>Protein Hewani</th>
                      <th colSpan="2" className="px-3 py-3 text-sm font-bold text-neutral-900 text-center w-1/5" style={{ border: '1px solid #9ca3af' }}>Sayur</th>
                      <th colSpan="2" className="px-3 py-3 text-sm font-bold text-neutral-900 text-center w-1/5" style={{ border: '1px solid #9ca3af' }}>Protein Nabati</th>
                      <th colSpan="2" className="px-3 py-3 text-sm font-bold text-neutral-900 text-center w-1/5" style={{ border: '1px solid #9ca3af' }}>Protein Tambahan</th>
                    </tr>
                    {/* Baris Sub-header Nama & Porsi */}
                    <tr className="bg-neutral-100">
                      <th className="px-3 py-2 text-xs font-semibold text-neutral-800" style={{ border: '1px solid #9ca3af' }}>Nama</th>
                      <th className="px-2 py-2 text-xs font-semibold text-neutral-800 text-center w-14" style={{ border: '1px solid #9ca3af' }}>Porsi</th>
                      <th className="px-3 py-2 text-xs font-semibold text-neutral-800" style={{ border: '1px solid #9ca3af' }}>Nama</th>
                      <th className="px-2 py-2 text-xs font-semibold text-neutral-800 text-center w-14" style={{ border: '1px solid #9ca3af' }}>Porsi</th>
                      <th className="px-3 py-2 text-xs font-semibold text-neutral-800" style={{ border: '1px solid #9ca3af' }}>Nama</th>
                      <th className="px-2 py-2 text-xs font-semibold text-neutral-800 text-center w-14" style={{ border: '1px solid #9ca3af' }}>Porsi</th>
                      <th className="px-3 py-2 text-xs font-semibold text-neutral-800" style={{ border: '1px solid #9ca3af' }}>Nama</th>
                      <th className="px-2 py-2 text-xs font-semibold text-neutral-800 text-center w-14" style={{ border: '1px solid #9ca3af' }}>Porsi</th>
                      <th className="px-3 py-2 text-xs font-semibold text-neutral-800" style={{ border: '1px solid #9ca3af' }}>Nama</th>
                      <th className="px-2 py-2 text-xs font-semibold text-neutral-800 text-center w-14" style={{ border: '1px solid #9ca3af' }}>Porsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, idx) => {
                      const renderNameCell = (item) => (
                        <td className="px-3 py-2.5 text-sm text-neutral-800 align-top" style={{ border: '1px solid #9ca3af' }}>
                          {item ? item[0] : ''}
                        </td>
                      );
                      const renderQtyCell = (item) => (
                        <td className="px-2 py-2.5 text-sm font-bold text-neutral-900 text-center align-top bg-neutral-50" style={{ border: '1px solid #9ca3af' }}>
                          {item ? item[1] : ''}
                        </td>
                      );

                      return (
                        <tr key={idx} className="hover:bg-neutral-100 transition-colors">
                          {renderNameCell(row.karbo)}
                          {renderQtyCell(row.karbo)}
                          
                          {renderNameCell(row.hewani)}
                          {renderQtyCell(row.hewani)}
                          
                          {renderNameCell(row.sayur)}
                          {renderQtyCell(row.sayur)}
                          
                          {renderNameCell(row.nabati)}
                          {renderQtyCell(row.nabati)}
                          
                          {renderNameCell(row.tambahan)}
                          {renderQtyCell(row.tambahan)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Catatan Rangkuman Dapur / Koki (Format Simpel & Formal) */}
            <div className="bg-white mb-8 overflow-hidden" style={{ border: '1px solid #9ca3af' }}>
              <div 
                className="bg-primary-50 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
                style={{ borderBottom: '1px solid #9ca3af' }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-700" />
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-wide">
                    Catatan Rangkuman Dapur ({formatServingDateDisplay(activeServingDateObj)})
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsChefNoteModalOpen(true)}
                  leftIcon={<FileEdit className="w-3.5 h-3.5" />}
                >
                  {chefDailyNote ? 'Edit Catatan' : 'Buat Catatan'}
                </Button>
              </div>

              <div className="p-4">
                {chefDailyNote ? (
                  <div className="text-sm text-neutral-900 leading-relaxed font-sans whitespace-pre-wrap">
                    {chefDailyNote}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-neutral-500">
                    Belum ada catatan rangkuman dapur untuk jadwal {selectedDateMode === 'today' ? 'Hari Ini' : 'Besok'}.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}

        <ChefNoteSynthesizerModal
          isOpen={isChefNoteModalOpen}
          onClose={() => setIsChefNoteModalOpen(false)}
          orders={rawOrders}
          servingDate={activeServingDateStr}
          onSaved={(savedNote) => setChefDailyNote(savedNote)}
        />
      </div>
    </PageTransition>
  );
}
