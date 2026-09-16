/**
 * NAMA FILE: Dashboard.jsx
 * FUNGSI UTAMA: Halaman antarmuka khusus untuk staf/Admin Gizi Rumah Sakit.
 * 
 * DETAIL:
 * - Membutuhkan otentikasi admin.
 * - Digunakan untuk memantau pesanan, mengelola siklus menu, atau melihat laporan statistik dapur.
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Sun, 
  Utensils, 
  Moon, 
  PlusCircle, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown
} from 'lucide-react';
import RekapCard from '../../components/ui/cards/RekapCard';
import OrdersTable from '../../components/ui/tables/OrdersTable';
import NoteDetailModal from '../../components/ui/modals/NoteDetailModal';
import { groupOrdersForTable } from '../../utils/orderTransformer';
import { getOrders } from '../../services/orderService';
import { supabase } from '../../utils/supabase';
import PageTransition from '../../components/PageTransition';


const toDateInputString = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function Dashboard() {
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedNoteData, setSelectedNoteData] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  
  const fetchOrderData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      setRawOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Gagal mengambil data pesanan dari database');
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    fetchOrderData();

    
    const subscription = supabase
      .channel('public:Order')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order' }, () => {
        fetchOrderData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchOrderData]);

  
  const tomorrowObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const tomorrowStr = useMemo(() => toDateInputString(tomorrowObj), [tomorrowObj]);

  
  const cycleNumber = useMemo(() => {
    const day = tomorrowObj.getDate();
    let num = day % 10;
    if (num === 0) num = 10;
    if (day === 31) num = 11;
    return num;
  }, [tomorrowObj]);

  
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

  // Transform data mentah harian ke 1 baris per pasien/orderCode
  const tableData = useMemo(() => {
    return groupOrdersForTable(filteredDailyOrders);
  }, [filteredDailyOrders]);

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
      const paket = (order.paketName || order.menuName || 'Paket').trim();
      const isEkstra = (order.type || '').toUpperCase() === 'EXCLUDE';

      if (isEkstra) {
        ekstraTotal += qty;
        ekstraNames.add(order.menuName || order.paketName || 'Menu Ekstra');
      }

      const targetMeal = (meal === 'SORE' || meal === 'MALAM') ? 'SORE' : meal;
      if (mealStats[targetMeal]) {
        mealStats[targetMeal].total += qty;
        mealStats[targetMeal].packages[paket] = (mealStats[targetMeal].packages[paket] || 0) + qty;
      }
    });

    const formatDetails = (packagesObj) => {
      const entries = Object.entries(packagesObj);
      if (entries.length === 0) {
        return [
          { label: 'Paket A', value: 0 },
          { label: 'Paket B', value: 0 },
        ];
      }
      return entries
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .map(([label, value]) => ({ label, value }));
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
  }, [filteredDailyOrders]);

  
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (row.rmNumber && row.rmNumber.toLowerCase().includes(query)) ||
        (row.patientName && row.patientName.toLowerCase().includes(query)) ||
        (row.pasienRM && row.pasienRM.toLowerCase().includes(query)) ||
        (row.kamar && row.kamar.toLowerCase().includes(query)) ||
        (row.makanPagi && row.makanPagi.toLowerCase().includes(query)) ||
        (row.makanSiang && row.makanSiang.toLowerCase().includes(query)) ||
        (row.makanMalam && row.makanMalam.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      
      if (selectedFilter === 'ALLERGY') return row.hasAllergy;
      if (selectedFilter === 'NOTE') return row.hasCatatan;
      if (selectedFilter === 'VIP') return row.kamar.toLowerCase().includes('vip');

      return true;
    });
  }, [tableData, searchQuery, selectedFilter]);

  const handleOpenNote = (rowData) => {
    setSelectedNoteData(rowData);
    setIsNoteModalOpen(true);
  };

  const handleCloseNote = () => {
    setIsNoteModalOpen(false);
    setSelectedNoteData(null);
  };

  const formatServingDateDisplay = (d) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <PageTransition>
    <div className="space-y-6 w-full">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        {}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            Siklus Aktif: Hari ke-{cycleNumber}
          </span>
          <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
            Penyajian Besok (T+1): {formatServingDateDisplay(tomorrowObj)}
          </span>
          <span className="text-xs text-neutral-500 font-medium hidden md:inline">
            Cut-Off: 15:00 WIB
          </span>
        </div>

        {}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrderData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg border border-primary-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Muat ulang data dari database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 p-3 rounded-lg flex items-center gap-2 text-xs text-danger-700">
          <AlertCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Cards Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {/* Card Makan Pagi */}
        <RekapCard
          title="Makan Pagi"
          icon={<Sun className="w-4 h-4 text-warning-500" />}
          total={stats.pagi.total}
          totalLabel="Total Porsi"
          details={stats.pagi.details}
        />

        {/* Card Makan Siang */}
        <RekapCard
          title="Makan Siang"
          icon={<Utensils className="w-4 h-4 text-primary-600" />}
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

      {/* Search & Filter Controls */}
      <section className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-neutral-900">
          Detail Rekap Pesanan
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari Nama Pasien, No. RM, atau Nomor Kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-0 border border-neutral-300 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full appearance-none bg-neutral-0 border border-neutral-300 rounded-lg px-3.5 py-2 pr-9 text-xs sm:text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
            >
              <option value="ALL">Semua</option>
              <option value="ALLERGY">Alergi</option>
              <option value="NOTE">Ada Catatan</option>
              <option value="VIP">Kelas VIP</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Button */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-neutral-0 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Cari Data</span>
          </button>
        </div>
      </section>

      {}
      <section className="w-full">
        {loading && tableData.length === 0 ? (
          <div className="w-full bg-white rounded-xl border border-neutral-200 p-12 text-center text-xs text-neutral-500 shadow-sm flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary-600 animate-spin" />
            <span>Memuat data pesanan dari database...</span>
          </div>
        ) : (
          <OrdersTable data={filteredData} onNoteClick={handleOpenNote} />
        )}
      </section>

      {}
      <NoteDetailModal
        isOpen={isNoteModalOpen}
        onClose={handleCloseNote}
        data={selectedNoteData}
      />
    </div>
    </PageTransition>
  );
}
