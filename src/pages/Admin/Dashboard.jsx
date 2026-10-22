import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Sun, 
  Utensils, 
  Moon, 
  PlusCircle, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  Users, 
  ClipboardList 
} from 'lucide-react';
import RekapCard from '../../components/ui/cards/RekapCard';
import { OrdersTable } from '../../components/ui/tables/OrdersTable';
import NoteDetailModal from '../../components/ui/modals/NoteDetailModal';
import ComponentEditModal from '../../components/ui/modals/ComponentEditModal';
import { groupOrdersForTable, normalizeDateToYYYYMMDD } from '../../utils/orderTransformer';
import { getTodayOrders, getOrders, deleteOrderItem, enrichOrdersWithPatientAllergies, clearPatientCache } from '../../services/orderService';
import { getTotalActivePatients } from '../../services/patientService';
import { getActiveCycleMenu } from '../../services/menuService';
import PageTransition from '../../components/PageTransition';
import appConfig from '../../config/appConfig';


// Konversi objek tanggal ke format string YYYY-MM-DD
const toDateInputString = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Halaman utama dashboard dapur gizi: rekapitulasi porsi & pemantauan pesanan pasien
export default function Dashboard() {
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('TODAY');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNoteData, setSelectedNoteData] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [patientCensus, setPatientCensus] = useState({ totalPasien: 0, pasienKelas: 0, pasienVip: 0 });

  // Hitung jumlah pasien VIP dan Kelas dari sensus atau pesanan aktif
  const { vipCount, kelasCount } = useMemo(() => {
    let vip = Number(patientCensus?.pasienVip) || 0;
    let kelas = Number(patientCensus?.pasienKelas) || 0;

    if (vip === 0 && kelas === 0 && Array.isArray(rawOrders) && rawOrders.length > 0) {
      const vipSet = new Set();
      const kelasSet = new Set();
      rawOrders.forEach(o => {
        const room = String(o.roomNumber || o.classType || o.kamar || '').toLowerCase();
        const isVip = room.includes('vip') || room.includes('suite');
        const patientKey = o.patientId || o.rmNumber || o.consumer_name;
        if (patientKey) {
          if (isVip) vipSet.add(patientKey);
          else kelasSet.add(patientKey);
        }
      });
      vip = vipSet.size;
      kelas = kelasSet.size;
    }

    return { vipCount: vip, kelasCount: kelas };
  }, [patientCensus, rawOrders]);

  const [selectedComponentMeal, setSelectedComponentMeal] = useState(null);

  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Tanggal penyajian esok hari (T+1)
  const tomorrowObj = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    return d;
  }, [currentDate]);

  const todayStr = useMemo(() => toDateInputString(currentDate), [currentDate]);
  const tomorrowStr = useMemo(() => toDateInputString(tomorrowObj), [tomorrowObj]);

  // Nomor siklus menu hari ini dan besok
  const todayCycleNumber = useMemo(() => {
    const day = currentDate.getDate();
    let num = day % 10;
    if (num === 0) num = 10;
    if (day === 31) num = 11;
    return num;
  }, [currentDate]);

  const tomorrowCycleNumber = useMemo(() => {
    const day = tomorrowObj.getDate();
    let num = day % 10;
    if (num === 0) num = 10;
    if (day === 31) num = 11;
    return num;
  }, [tomorrowObj]);

  // Utilitas normalisasi tanggal order/row ke format YYYY-MM-DD
  const getOrderDateStr = useCallback((item) => {
    if (!item) return '';
    const dateVal = item.servingDate || item.serving_date || item.createdAt || item.created_at;
    return normalizeDateToYYYYMMDD(dateVal);
  }, []);

  const isViewingToday = selectedFilter === 'TODAY';
  const activeCycleNumber = isViewingToday ? todayCycleNumber : tomorrowCycleNumber;
  const activeDateObj = isViewingToday ? currentDate : tomorrowObj;
  const activeDateStr = isViewingToday ? todayStr : tomorrowStr;

  const [cycleMenuItems, setCycleMenuItems] = useState([]);

  // Ambil referensi hidangan menu siklus aktif sesuai tanggal yang sedang dipantau
  useEffect(() => {
    let isMounted = true;
    getActiveCycleMenu(activeCycleNumber)
      .then((items) => {
        if (isMounted && Array.isArray(items)) {
          setCycleMenuItems(items);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat menu siklus untuk kartu rekapitulasi:', err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCycleNumber]);

  // Lookup map dari paketName & mealTime ke nama hidangan aktual (cth: 'PAGI_PAKET A' -> 'Nasi Liwet Solo')
  const cycleMenuLookup = useMemo(() => {
    const map = {};
    if (Array.isArray(cycleMenuItems)) {
      cycleMenuItems.forEach(item => {
        const meal = (item.mealTime || '').toUpperCase();
        const targetMeal = meal === 'MALAM' ? 'SORE' : meal;
        const paket = (item.paketName || '').toUpperCase();
        if (targetMeal && paket && item.name) {
          map[`${targetMeal}_${paket}`] = item.name.trim();
        }
      });
    }
    return map;
  }, [cycleMenuItems]);

  // Reset pagination saat pencarian atau filter kategori berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, pageSize]);

  // Ambil data pesanan rawat inap dari API sistem RS secara bertahap (progressive loading)
  const fetchOrderData = useCallback(async (options = {}) => {
    const isSilent = Boolean(options.isSilent);
    const isForce = Boolean(options.force);

    if (isForce) {
      clearPatientCache();
    }

    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);

      // Langkah 1: Ambil seluruh pesanan dari /webhook/all-order-item via getOrders()
      // Memuat riwayat lengkap termasuk pesanan baru hari ini & besok
      let allData = [];
      try {
        allData = await getOrders({ withPatientAllergies: false });
      } catch (errAll) {
        console.warn('Gagal getOrders all:', errAll.message);
      }

      // Langkah 2: Ambil juga dari endpoint /webhook/order-item-hari
      let todayData = [];
      try {
        todayData = await getTodayOrders({ withPatientAllergies: false });
      } catch (errToday) {
        console.warn('Gagal getTodayOrders:', errToday.message);
      }

      // Gabungkan dan deduplikasi data pesanan berdasarkan item.id atau kunci unik
      const combinedMap = new Map();
      [...(allData || []), ...(todayData || [])].forEach(item => {
        if (!item) return;
        const key = item.id 
          ? String(item.id) 
          : `${item.patientId || item.rmNumber}_${item.mealTime}_${item.menuName}_${item.servingDate || item.createdAt}`;
        combinedMap.set(key, item);
      });

      let data = Array.from(combinedMap.values());

      setRawOrders(data || []);

      // Ambil sensus total pasien rawat inap aktif dari endpoint /webhook/total-pasien-aktif
      getTotalActivePatients()
        .then((census) => {
          if (census && census.totalPasien > 0) {
            setPatientCensus(census);
          }
        })
        .catch((censusErr) => {
          console.warn('Gagal memuat sensus pasien aktif:', censusErr.message);
        });

      // Langsung matikan loading agar tabel dan 4 kartu rekapitulasi langsung tampil
      if (!isSilent) {
        setLoading(false);
      }

      // Langkah 3 (Background): Perkaya data pesanan dengan riwayat alergi pasien di latar belakang
      if (data && data.length > 0) {
        enrichOrdersWithPatientAllergies(data)
          .then((enriched) => {
            if (Array.isArray(enriched)) {
              setRawOrders(enriched);
            }
          })
          .catch((enrichErr) => {
            console.warn('Gagal memuat riwayat alergi pasien di latar belakang:', enrichErr);
          });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Gagal mengambil data pesanan dari sistem rumah sakit');
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrderData();

    // Polling setiap 30 detik untuk sinkronisasi pesanan dari sistem RS (silent background)
    const interval = setInterval(() => {
      fetchOrderData({ isSilent: true });
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchOrderData]);

  // Pantau pergantian tanggal untuk menyinkronkan data hari berikutnya secara otomatis
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate((prev) => {
        if (prev.toDateString() !== now.toDateString()) {
          fetchOrderData({ isSilent: false });
          return now;
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(timer);
  }, [fetchOrderData]);

  // Filter pesanan harian untuk 4 kartu ringkasan sesuai tanggal aktif (Hari Ini vs Besok)
  const filteredDailyOrders = useMemo(() => {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders.filter((order) => {
      const dStr = getOrderDateStr(order);
      return dStr === activeDateStr;
    });
  }, [rawOrders, activeDateStr, getOrderDateStr]);

  // Kumpulan pesanan untuk tabel sesuai tanggal aktif
  const tableDailyOrders = useMemo(() => {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders.filter((order) => {
      const dStr = getOrderDateStr(order);
      return dStr === activeDateStr;
    });
  }, [rawOrders, activeDateStr, getOrderDateStr]);

  // Transform data mentah harian ke 1 baris per pasien/orderCode
  const tableData = useMemo(() => {
    if (!Array.isArray(tableDailyOrders)) return [];
    return groupOrdersForTable(tableDailyOrders);
  }, [tableDailyOrders]);

  // Hitung ringkasan 4 kartu secara otomatis dari filtered daily orders
  const stats = useMemo(() => {
    const mealStats = {
      PAGI: { total: 0, packages: {} },
      SIANG: { total: 0, packages: {} },
      SORE: { total: 0, packages: {} },
    };
    let ekstraTotal = 0;
    const ekstraNames = new Set();

    filteredDailyOrders.forEach(order => {
      const qty = order.quantity || 1;
      const meal = (order.mealTime || '').toUpperCase();
      const targetMeal = meal === 'MALAM' ? 'SORE' : meal;

      // Prioritaskan nama menu aktual (menuName / name), jika kosong/hanya Paket A/B, lakukan lookup ke siklus T+1
      let rawName = (order.menuName || order.name || '').trim();
      if (!rawName || rawName === '-' || /^paket\s+[a-z]$/i.test(rawName)) {
        const key = `${targetMeal}_${(order.paketName || rawName).toUpperCase()}`;
        if (cycleMenuLookup[key]) {
          rawName = cycleMenuLookup[key];
        } else if (!rawName || rawName === '-') {
          rawName = order.paketName || 'Menu';
        }
      }
      const menuLabel = rawName.trim();

      const isEkstra = (order.type || '').toUpperCase() === 'EXCLUDE';
      if (isEkstra) {
        ekstraTotal += qty;
        ekstraNames.add(menuLabel || 'Menu Ekstra');
      } else {
        if (mealStats[targetMeal]) {
          mealStats[targetMeal].total += qty;
          mealStats[targetMeal].packages[menuLabel] = (mealStats[targetMeal].packages[menuLabel] || 0) + qty;
        }
      }
    });

    const formatDetails = (packagesObj) => {
      const entries = Object.entries(packagesObj).filter(([_, value]) => value > 0);
      let res = [];
      if (entries.length === 0) {
        res = [
          { label: 'Belum ada pesanan', value: 0 },
        ];
      } else {
        res = entries
          .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
          .map(([label, value]) => ({ label, value }));
      }
      return res;
    };

    return {
      pagi: {
        total: mealStats.PAGI.total,
        details: formatDetails(mealStats.PAGI.packages),
      },
      siang: {
        total: mealStats.SIANG.total,
        details: formatDetails(mealStats.SIANG.packages),
      },
      malam: {
        total: mealStats.SORE.total,
        details: formatDetails(mealStats.SORE.packages),
      },
      ekstra: {
        total: ekstraTotal,
        kinds: ekstraNames.size,
      },
    };
  }, [filteredDailyOrders, cycleMenuItems, cycleMenuLookup]);

  
  // Filter data tabel berdasarkan pencarian kata kunci dan filter kategori/tanggal
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      
      const query = searchQuery.toLowerCase().trim();
      const cleanQuery = query.replace(/^rm\s*-?\s*/i, '').replace(/[-.\s]/g, '');
      const cleanRowRm = (row.rmNumber || '').replace(/^rm\s*-?\s*/i, '').replace(/[-.\s]/g, '');

      const matchesSearch =
        !query ||
        (row.rmNumber && row.rmNumber.toLowerCase().includes(query)) ||
        (cleanQuery && cleanRowRm && (cleanRowRm.includes(cleanQuery) || cleanQuery.includes(cleanRowRm))) ||
        (row.noReg && row.noReg.toLowerCase().includes(query)) ||
        (row.patientName && row.patientName.toLowerCase().includes(query)) ||
        (row.pasienRM && row.pasienRM.toLowerCase().includes(query)) ||
        (row.kamar && row.kamar.toLowerCase().includes(query)) ||
        (row.makanPagi && row.makanPagi.toLowerCase().includes(query)) ||
        (row.makanSiang && row.makanSiang.toLowerCase().includes(query)) ||
        ((row.makanSore || row.makanMalam) && (row.makanSore || row.makanMalam).toLowerCase().includes(query));

      if (!matchesSearch) return false;

      const rowDateStr = getOrderDateStr(row);

      if (selectedFilter === 'TODAY') {
        return rowDateStr === todayStr;
      }
      if (selectedFilter === 'TOMORROW') {
        return rowDateStr === tomorrowStr;
      }
      if (selectedFilter === 'ALLERGY') return row.hasAllergy;
      if (selectedFilter === 'NOTE') return row.hasCatatan;
      if (selectedFilter === 'VIP') {
        const kamar = (row.kamar || '').toLowerCase();
        return kamar.includes('vip') || kamar.includes('suite');
      }
      if (selectedFilter === 'KELAS') {
        const kamar = (row.kamar || '').toLowerCase();
        const isVip = kamar.includes('vip') || kamar.includes('suite');
        return !isVip && (kamar.includes('kelas') || (kamar !== '-' && kamar !== ''));
      }

      return true;
    });
  }, [tableData, searchQuery, selectedFilter, todayStr, tomorrowStr, getOrderDateStr]);

  // Buka modal rincian catatan pesanan pasien
  const handleOpenNote = (rowData) => {
    setSelectedNoteData(rowData);
    setIsNoteModalOpen(true);
  };

  // Tutup modal rincian catatan pesanan
  const handleCloseNote = () => {
    setIsNoteModalOpen(false);
    setSelectedNoteData(null);
  };

  // Buka modal edit komponen makanan per sesi makan
  const handleMealClick = useCallback((row, mealTime, items) => {
    setSelectedComponentMeal({ row, mealTime, items });
  }, []);

  // Tutup modal edit komponen dan muat ulang data pesanan
  const handleCloseComponentModal = useCallback(() => {
    setSelectedComponentMeal(null);
    fetchOrderData({ force: true });
  }, [fetchOrderData]);

  // Format tanggal penyajian ke teks formal bahasa Indonesia
  const formatServingDateDisplay = (d) => {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '-';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <PageTransition>
    <div className="space-y-6 w-full pb-10">
      {/* Header info siklus menu, total pasien aktif, dan tanggal saji T+1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary-600" />
            Rekapitulasi Pesanan Pasien
          </h1>
          <p className="text-sm text-neutral-500 mt-1 mb-3">
            Monitoring dan rekapitulasi distribusi paket menu gizi rawat inap.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>
            Siklus Hari {activeCycleNumber}
          </span>
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200"
            title={`Sensus Pasien Rawat Inap: ${vipCount} Pasien VIP, ${kelasCount} Pasien Kelas`}
          >
            <Users className="w-3.5 h-3.5 text-primary-600" />
            <span>VIP: {vipCount} Pasien</span>
            <span className="text-primary-300">|</span>
            <span>Kelas: {kelasCount} Pasien</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 flex flex-col items-end">
            <span className="text-[10px] text-neutral-500 leading-none">
              {isViewingToday ? 'Penyajian Hari-H' : 'Penyajian T+1'}
            </span>
            <span>{formatServingDateDisplay(activeDateObj)}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchOrderData({ force: true })}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer border-none outline-none ring-0 shadow-none"
            title="Muat ulang data pesanan dari database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Banner pesan error jika gagal mengambil data */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 p-3 rounded-lg flex items-center gap-2 text-sm text-danger-700">
          <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Kartu ringkasan porsi (Pagi, Siang, Sore, Ekstra) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {/* Card Makan Pagi */}
        <RekapCard
          title="Makan Pagi"
          icon={<Sun className="w-4 h-4 text-primary-600" />}
          total={stats.pagi.total}
          totalLabel="Total Porsi"
          details={stats.pagi.details}
        />

        {/* Card Makan Siang */}
        <RekapCard
          title="Makan Siang"
          icon={<Utensils className="w-4 h-4 text-warning-500" />}
          total={stats.siang.total}
          totalLabel="Total Porsi"
          details={stats.siang.details}
        />

        {/* Card Makan Sore */}
        <RekapCard
          title="Makan Sore"
          icon={<Moon className="w-4 h-4 text-indigo-600" />}
          total={stats.malam.total}
          totalLabel="Total Porsi"
          details={stats.malam.details}
        />

        {/* Card Ekstra */}
        <RekapCard
          title="Ekstra"
          icon={<PlusCircle className="w-4 h-4 text-success-600" />}
          total={stats.ekstra.total}
          totalLabel="Total Item"
          details={[
            { label: `${stats.ekstra.kinds} Jenis Menu`, value: stats.ekstra.total },
          ]}
        />
      </section>

      {/* Bagian kontrol pencarian, filter, dan tabel rekapitulasi */}
      <section className="space-y-3 pt-2 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">
              Detail Rekap Pesanan Pasien
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Batas Pemesanan Utama (Cut-Off): <strong className="text-danger-600">{appConfig.CUTOFF_MAIN_TEXT}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            {/* Input pencarian pasien / No. RM / kamar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari Nama / No. RM / Kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
              />
            </div>

            {/* Dropdown filter kategori & tanggal */}
            <div className="relative w-full sm:w-44">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full h-9 appearance-none bg-white border border-neutral-300 rounded-lg pl-3 pr-7 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-xs"
              >
                <option value="TODAY">Pesanan Hari Ini</option>
                <option value="TOMORROW">Pesanan Besok</option>
                <option value="ALLERGY">Ada Alergi</option>
                <option value="NOTE">Ada Catatan</option>
                <option value="VIP">VIP</option>
                <option value="KELAS">Kelas</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Dropdown batas baris per halaman */}
            <div className="relative w-full sm:w-32">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-9 appearance-none bg-white border border-neutral-300 rounded-lg pl-3 pr-7 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-xs"
                title="Batas jumlah baris per halaman"
              >
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
                <option value={50}>50 Baris</option>
                <option value="ALL">Semua</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="w-full">
          {loading && tableData.length === 0 ? (
            <div className="w-full bg-white rounded-xl border border-neutral-200 p-12 text-center text-sm text-neutral-500 shadow-sm flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
              <span>Memuat rekapitulasi pesanan pasien...</span>
            </div>
          ) : (
            <OrdersTable 
              data={filteredData} 
              onNoteClick={handleOpenNote} 
              onMealClick={handleMealClick}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </section>

      <NoteDetailModal
        isOpen={isNoteModalOpen}
        onClose={handleCloseNote}
        data={selectedNoteData}
      />
      
      <ComponentEditModal
        isOpen={!!selectedComponentMeal}
        onClose={handleCloseComponentModal}
        selectedMeal={selectedComponentMeal}
        cycleNumber={activeCycleNumber}
      />
    </div>
    </PageTransition>
  );
}
