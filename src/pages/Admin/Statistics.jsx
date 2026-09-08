import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  RefreshCw, 
  ChevronDown,
  Utensils,
  BarChart2,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders } from '../../services/orderService';
import RekapCard from '../../components/ui/cards/RekapCard';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function Statistics() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      else setLoading(true);

      const data = await getOrders();
      setRawOrders(data || []);

      if (showToast) {
        toast.success('Data diperbarui');
      }
    } catch (err) {
      console.error('Failed to load orders for statistics:', err);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter orders by month and year
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const dateVal = order.servingDate || order.createdAt;
      if (!dateVal) return false;
      const d = new Date(dateVal);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [rawOrders, selectedMonth, selectedYear]);

  // Aggregate stats
  const stats = useMemo(() => {
    let total = 0;
    const map = {};

    filteredOrders.forEach((order) => {
      const qty = order.quantity || 1;
      total += qty;

      const name = (order.menuName || order.paketName || 'Menu').trim();
      if (!map[name]) {
        map[name] = { name, count: 0 };
      }
      map[name].count += qty;
    });

    const list = Object.values(map).map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0',
    }));

    // Descending for Top
    const desc = [...list].sort((a, b) => b.count - a.count);
    const top5 = desc.slice(0, 5);

    // Ascending for Bottom
    const asc = [...list].sort((a, b) => a.count - b.count);
    const bottom5 = asc.slice(0, 5);

    return {
      total,
      totalKinds: list.length,
      top5,
      bottom5,
      topItem: top5[0] || null,
      bottomItem: bottom5[0] || null,
    };
  }, [filteredOrders]);

  const maxTopCount = stats.top5[0]?.count || 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
            Laporan Menu Bulanan
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ringkasan konsumsi dan evaluasi menu per periode.
          </p>
        </div>

        {/* Filter Month / Year & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-neutral-0 border border-neutral-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-600 transition-colors cursor-pointer"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Year Selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-neutral-0 border border-neutral-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-600 transition-colors cursor-pointer"
            >
              {[2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh */}
          <button
            onClick={() => loadOrders(true)}
            disabled={loading || isRefreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-0 hover:bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-0 hover:bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Cetak Laporan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 3 Simple KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Total Portions */}
        <RekapCard
          title="Total Porsi Disajikan"
          icon={<BarChart2 className="w-4 h-4 text-primary-600" />}
          total={loading ? '...' : stats.total}
          totalLabel="Porsi"
          details={[
            { label: 'Variasi Menu', value: `${stats.totalKinds} Menu` },
            { label: 'Periode', value: `${MONTHS[selectedMonth]} ${selectedYear}` },
          ]}
        />

        {/* Most Ordered */}
        <RekapCard
          title="Menu Paling Laku"
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
          total={loading ? '...' : (stats.topItem?.count || 0)}
          totalLabel="Porsi"
          details={[
            { label: 'Nama Menu', value: stats.topItem?.name || '-' },
            { label: 'Pangsa Pesanan', value: stats.topItem ? `${stats.topItem.percentage}%` : '-' },
          ]}
        />

        {/* Least Ordered */}
        <RekapCard
          title="Menu Paling Sedikit"
          icon={<TrendingDown className="w-4 h-4 text-amber-600" />}
          total={loading ? '...' : (stats.bottomItem?.count || 0)}
          totalLabel="Porsi"
          details={[
            { label: 'Nama Menu', value: stats.bottomItem?.name || '-' },
            { label: 'Pangsa Pesanan', value: stats.bottomItem ? `${stats.bottomItem.percentage}%` : '-' },
          ]}
        />
      </section>

      {/* Empty State */}
      {!loading && stats.total === 0 && (
        <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-8 text-center text-neutral-400">
          <Utensils className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
          <p className="text-xs">Tidak ada data pesanan pada periode {MONTHS[selectedMonth]} {selectedYear}.</p>
        </div>
      )}

      {/* 2 Comparison Cards (Side-by-side) */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Top 5 Most Popular */}
          <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                5 Menu Paling Banyak Dipesan
              </h2>
              <span className="text-xs text-neutral-400">Porsi / %</span>
            </div>

            <div className="space-y-3.5">
              {stats.top5.map((item, index) => {
                const percentWidth = Math.max((item.count / maxTopCount) * 100, 4);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-4 text-neutral-400 font-semibold">{index + 1}.</span>
                        <span className="font-semibold text-neutral-800 truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-neutral-900 whitespace-nowrap">
                        {item.count} <span className="text-neutral-400 font-normal">({item.percentage}%)</span>
                      </span>
                    </div>
                    {/* Clean flat progress bar */}
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 5 Least Popular */}
          <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                5 Menu Paling Sedikit Dipesan
              </h2>
              <span className="text-xs text-neutral-400">Porsi / %</span>
            </div>

            <div className="space-y-3.5">
              {stats.bottom5.map((item, index) => {
                const percentWidth = Math.max((item.count / maxTopCount) * 100, 4);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-4 text-neutral-400 font-semibold">{index + 1}.</span>
                        <span className="font-semibold text-neutral-800 truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-neutral-900 whitespace-nowrap">
                        {item.count} <span className="text-neutral-400 font-normal">({item.percentage}%)</span>
                      </span>
                    </div>
                    {/* Clean flat progress bar */}
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-neutral-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
