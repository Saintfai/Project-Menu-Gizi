import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, AlertCircle, FileText, ChefHat, UtensilsCrossed, Info, X, ChevronDown
} from 'lucide-react';
import { getOrders } from '../../services/orderService';
import { getMenuItemsByCycle } from '../../services/menuService';
import PageTransition from '../../components/PageTransition';

const toDateInputString = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function Chef() {
  const [rawOrders, setRawOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedMealTime, setSelectedMealTime] = useState('Semua');

  const fetchChefData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData] = await Promise.all([
        getOrders(),
      ]);
      setRawOrders(ordersData || []);
    } catch (err) {
      console.error('Failed to fetch chef data:', err);
      setError(err.message || 'Gagal mengambil data pesanan.');
    } finally {
      setLoading(false);
    }
  }, []);

  const tomorrowObj = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    return d;
  }, [currentDate]);

  const tomorrowStr = useMemo(() => toDateInputString(tomorrowObj), [tomorrowObj]);

  const cycleNumber = useMemo(() => {
    const day = tomorrowObj.getDate();
    let num = day % 10;
    if (num === 0) num = 10;
    if (day === 31) num = 11;
    return num;
  }, [tomorrowObj]);

  // Fetch menus when cycleNumber is determined
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

  const filteredDailyOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const dateVal = order.servingDate || order.createdAt;
      if (!dateVal) return false;
      const d = new Date(dateVal);
      const localStr = !isNaN(d.getTime()) ? toDateInputString(d) : '';
      const isoPrefix = typeof dateVal === 'string' ? dateVal.slice(0, 10) : '';
      return localStr === tomorrowStr || isoPrefix === tomorrowStr;
    });
  }, [rawOrders, tomorrowStr]);

  // Process data for Chef (Unified Total)
  const chefStats = useMemo(() => {
    const overallStats = {
      Karbohidrat: {}, 
      'Protein Hewani': {}, 
      Sayur: {}, 
      'Protein Nabati': {}, 
      'Protein Tambahan': {}, 
      notes: []
    };

    filteredDailyOrders.forEach(order => {
      const qty = order.quantity || 1;
      let meal = (order.mealTime || '').toUpperCase();
      if (meal === 'MALAM') meal = 'SORE';

      if (selectedMealTime !== 'Semua' && meal !== selectedMealTime) {
        return;
      }

      const paket = (order.paketName || order.menuName || '').trim();
      
      // Find matching menu to get components
      const matchedMenu = menuItems.find(m => 
        (m.paketName?.trim().toLowerCase() === paket.toLowerCase() || m.name?.trim().toLowerCase() === paket.toLowerCase()) && 
        m.mealTime === meal
      );

      const addStat = (category, value) => {
        if (!value) return;
        const val = value.trim();
        if (val) {
          overallStats[category][val] = (overallStats[category][val] || 0) + qty;
        }
      };

      if (matchedMenu) {
        let karbo = matchedMenu.karbohidrat || '';
        let protein = matchedMenu.protein || '';
        let sayur = matchedMenu.sayur || '';
        let nabati = matchedMenu.nabati || '';
        let tambahan = matchedMenu.proteinTambahan || '';

        const existingNotes = order.notes || '';
        if (existingNotes) {
            const parseNote = (label, currentVal) => {
                if (existingNotes.includes(`[Tanpa ${label}]`)) return '';
                const match = existingNotes.match(new RegExp(`\\[Ganti ${label}: (.*?)\\]`));
                return match ? match[1] : currentVal;
            };

            karbo = parseNote('Karbohidrat', karbo);
            protein = parseNote('Protein Hewani', protein);
            sayur = parseNote('Sayur', sayur);
            nabati = parseNote('Protein Nabati', nabati);
            tambahan = parseNote('Protein Tambahan', tambahan);
        }

        addStat('Karbohidrat', karbo);
        addStat('Protein Hewani', protein);
        addStat('Sayur', sayur);
        addStat('Protein Nabati', nabati);
        addStat('Protein Tambahan', tambahan);
      } else {
        addStat('Karbohidrat', order.menuName);
      }

      // Add notes
      const allergy = order.patient?.allergies ?? order.allergies ?? order.allergyNote;
      const hasAllergy = allergy && allergy.trim().toLowerCase() !== 'tidak ada' && allergy.trim() !== '-';
      
      if (order.notes || hasAllergy) {
        overallStats.notes.push({
          patientName: order.patientName || order.patient?.name,
          room: order.roomNumber || order.kamar || '-',
          note: order.notes,
          allergy: hasAllergy ? allergy : null,
          menu: order.menuName || order.paketName,
          mealTime: meal
        });
      }
    });

    return overallStats;
  }, [filteredDailyOrders, menuItems, selectedMealTime]);

  // Prepare data for the unified 5-column table
  const karboEntries = Object.entries(chefStats['Karbohidrat']).sort((a, b) => b[1] - a[1]);
  const hewaniEntries = Object.entries(chefStats['Protein Hewani']).sort((a, b) => b[1] - a[1]);
  const sayurEntries = Object.entries(chefStats['Sayur']).sort((a, b) => b[1] - a[1]);
  const nabatiEntries = Object.entries(chefStats['Protein Nabati']).sort((a, b) => b[1] - a[1]);
  const tambahanEntries = Object.entries(chefStats['Protein Tambahan']).sort((a, b) => b[1] - a[1]);

  const maxRows = Math.max(
    karboEntries.length,
    hewaniEntries.length,
    sayurEntries.length,
    nabatiEntries.length,
    tambahanEntries.length
  );

  const tableRows = Array.from({ length: maxRows }).map((_, i) => ({
    karbo: karboEntries[i] || null,
    hewani: hewaniEntries[i] || null,
    sayur: sayurEntries[i] || null,
    nabati: nabatiEntries[i] || null,
    tambahan: tambahanEntries[i] || null,
  }));

  const groupedNotes = useMemo(() => {
    const groups = {};
    (chefStats?.notes || []).forEach(n => {
      const menuName = n.menu || 'Menu Lainnya';
      let noteText = n.note || '';

      const labels = ['Karbohidrat', 'Protein Hewani', 'Sayur', 'Protein Nabati', 'Protein Tambahan'];
      labels.forEach(label => {
          noteText = noteText.replace(new RegExp(`\\[Ganti ${label}: .*?\\]\\n?`, 'g'), '');
          noteText = noteText.replace(new RegExp(`\\[Tanpa ${label}\\]\\n?`, 'g'), '');
      });
      noteText = noteText.trim();

      if (n.allergy) {
         if (noteText) {
             noteText = `${noteText} (Alergi: ${n.allergy})`;
         } else {
             noteText = `Alergi: ${n.allergy}`;
         }
      }
      
      if (noteText) {
        const patientKey = `${n.patientName || 'Pasien'}|||${n.room || '-'}`;
        if (!groups[patientKey]) {
          groups[patientKey] = {
            patientName: n.patientName || 'Pasien',
            room: n.room || '-',
            notes: []
          };
        }
        if (!groups[patientKey].notes.includes(noteText)) {
          groups[patientKey].notes.push(noteText);
        }
      }
    });
    return Object.values(groups);
  }, [chefStats]);

  const hasAnyData = maxRows > 0;

  const formatServingDateDisplay = (d) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <PageTransition>
      <div className="space-y-6 w-full pb-10">
        {/* Header */}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>
              Siklus Hari {cycleNumber}
            </span>
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 flex flex-col items-end">
              <span className="text-[10px] text-neutral-500 leading-none">Penyajian T+1</span>
              <span>{formatServingDateDisplay(tomorrowObj)}</span>
            </div>
            <button
              onClick={fetchChefData}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
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

            {/* Notes Section Below Table */}
            {hasAnyData && groupedNotes.length > 0 && (
              <div className="mt-8 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Catatan Khusus per Pasien
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedNotes.map((group, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 shadow-sm flex flex-col gap-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold text-neutral-900 text-sm uppercase tracking-wide">{group.patientName}</div>
                        <div className="text-neutral-500 text-xs text-right shrink-0">Kamar {group.room}</div>
                      </div>
                      <div className="text-neutral-900 text-sm mt-1.5">Catatan:</div>
                      {group.notes.map((noteText, nIdx) => (
                        <div key={nIdx} className="text-sm text-neutral-800">
                          {noteText}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>
    </PageTransition>
  );
}
