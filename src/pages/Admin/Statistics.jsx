import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  RefreshCw, 
  ChevronDown,
  Utensils,
  BarChart2,
  Calendar,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders } from '../../services/orderService';
import RekapCard from '../../components/ui/cards/RekapCard';
import logoEdhos from '../../assets/logoedhos.png';

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
      allList: desc,
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

  const getPrintDateFormatted = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    return `${dayName}, ${dateStr} - ${timeStr}`;
  };

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* 1. TAMPILAN WEB (INTERAKTIF) - HANYA MUNCUL DI LAYAR (HIDDEN SAAT PRINT) */}
      {/* ========================================================================= */}
      <div className="no-print print:hidden space-y-6 max-w-6xl mx-auto">
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
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-0 hover:bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="Cetak Laporan Resmi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
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

      {/* ========================================================================= */}
      {/* 2. TEMPLATE DOKUMEN CETAK RESMI RUMAH SAKIT (PRINT-ONLY)                   */}
      {/* ========================================================================= */}
      <div className="hidden print:block text-neutral-900 bg-white w-full font-sans leading-tight">
        {/* KOP SURAT RESMI */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <img 
              src={logoEdhos} 
              alt="Logo RS Edelweiss" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-sm font-bold tracking-wide text-black uppercase">
                RUMAH SAKIT EDELWEISS
              </h1>
              <h2 className="text-[11px] font-bold text-neutral-800 tracking-normal uppercase">
                INSTALASI GIZI & PELAYANAN DIETETIK
              </h2>
              <p className="text-[8.5px] text-neutral-600 leading-tight">
                Jl. Soekarno Hatta No. 543, Sekejati, Buahbatu, Kota Bandung | Telp: (022) 86023000 | Email: gizi@edelweisshospital.id
              </p>
            </div>
          </div>
          <div className="text-right text-[8.5px] border border-neutral-400 px-2 py-1 rounded">
            <span className="font-bold block text-black">DOKUMEN RESMI</span>
            <span className="text-neutral-500">KODE: GIZ-REC-01</span>
          </div>
        </div>
        {/* Garis ganda kop surat */}
        <div className="border-b border-black mt-0.5 mb-3"></div>

        {/* JUDUL LAPORAN */}
        <div className="text-center mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider underline underline-offset-2">
            LAPORAN REKAPITULASI & EVALUASI KONSUMSI MENU GIZI
          </h3>
          <p className="text-[10px] font-semibold text-neutral-700 mt-0.5">
            Periode: {MONTHS[selectedMonth]} {selectedYear}
          </p>
        </div>

        {/* INFORMASI METADATA LAPORAN (COMPACT STRIP) */}
        <div className="text-[9px] mb-3 bg-neutral-50 border border-neutral-300 px-3 py-1.5 rounded">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <div>
              <span className="text-neutral-500 inline-block w-24">Unit Kerja:</span>
              <span className="font-semibold text-black">Instalasi Gizi & Dietetik</span>
            </div>
            <div>
              <span className="text-neutral-500 inline-block w-24">Tanggal Cetak:</span>
              <span className="font-semibold text-black">{getPrintDateFormatted()}</span>
            </div>
            <div>
              <span className="text-neutral-500 inline-block w-24">Periode Data:</span>
              <span className="font-semibold text-black">1 - {new Date(selectedYear, selectedMonth + 1, 0).getDate()} {MONTHS[selectedMonth]} {selectedYear}</span>
            </div>
            <div>
              <span className="text-neutral-500 inline-block w-24">Status Data:</span>
              <span className="font-semibold text-black">Final / Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* BAGIAN I: RINGKASAN INDIKATOR UTAMA (4 METRICS IN HORIZONTAL GRID) */}
        <div className="mb-3 print-avoid-break">
          <h4 className="text-[9.5px] font-bold text-black uppercase mb-1">
            I. RINGKASAN INDIKATOR UTAMA
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center text-[8.5px]">
            <div className="border border-neutral-300 bg-neutral-50/60 p-1.5 rounded">
              <span className="text-neutral-500 block text-[8px]">Total Porsi Disajikan</span>
              <span className="text-xs font-bold text-black block mt-0.5">{stats.total} Porsi</span>
            </div>
            <div className="border border-neutral-300 bg-neutral-50/60 p-1.5 rounded">
              <span className="text-neutral-500 block text-[8px]">Variasi Menu Beredar</span>
              <span className="text-xs font-bold text-black block mt-0.5">{stats.totalKinds} Jenis</span>
            </div>
            <div className="border border-neutral-300 bg-neutral-50/60 p-1.5 rounded text-left">
              <span className="text-neutral-500 block text-[8px] text-center">Menu Terfavorit</span>
              <span className="font-bold text-black block text-[8.5px] truncate mt-0.5" title={stats.topItem?.name}>
                {stats.topItem?.name || '-'}
              </span>
              <span className="text-neutral-500 block text-[7.5px]">
                {stats.topItem ? `${stats.topItem.count} Porsi (${stats.topItem.percentage}%)` : '-'}
              </span>
            </div>
            <div className="border border-neutral-300 bg-neutral-50/60 p-1.5 rounded text-left">
              <span className="text-neutral-500 block text-[8px] text-center">Menu Terendah</span>
              <span className="font-bold text-black block text-[8.5px] truncate mt-0.5" title={stats.bottomItem?.name}>
                {stats.bottomItem?.name || '-'}
              </span>
              <span className="text-neutral-500 block text-[7.5px]">
                {stats.bottomItem ? `${stats.bottomItem.count} Porsi (${stats.bottomItem.percentage}%)` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* BAGIAN II: TABEL REKAPITULASI & EVALUASI SELURUH MENU */}
        <div className="mb-4">
          <h4 className="text-[9.5px] font-bold text-black uppercase mb-1">
            II. REKAPITULASI & EVALUASI KONSUMSI MENU LENGKAP
          </h4>
          <table className="w-full border-collapse border border-neutral-300 text-[8.5px]">
            <thead>
              <tr className="bg-neutral-100 text-neutral-800">
                <th className="border border-neutral-300 px-1.5 py-1 text-center w-8 font-bold">NO</th>
                <th className="border border-neutral-300 px-2 py-1 text-left font-bold">NAMA MENU / PAKET HIDANGAN</th>
                <th className="border border-neutral-300 px-2 py-1 text-center w-24 font-bold">TOTAL PORSI</th>
                <th className="border border-neutral-300 px-2 py-1 text-center w-24 font-bold">KONTRIBUSI (%)</th>
                <th className="border border-neutral-300 px-2 py-1 text-left w-36 font-bold">STATUS EVALUASI</th>
              </tr>
            </thead>
            <tbody>
              {stats.allList && stats.allList.length > 0 ? (
                stats.allList.map((item, index) => {
                  const numPercent = Number(item.percentage);
                  let evalBadge = 'Stabil / Standar';
                  if (index < 2 || numPercent >= 15) {
                    evalBadge = 'Sangat Diminati';
                  } else if (numPercent < 5 || index >= stats.allList.length - 2) {
                    evalBadge = 'Perlu Evaluasi Siklus';
                  }

                  return (
                    <tr key={item.name} className={`print-avoid-break ${index % 2 === 1 ? 'bg-neutral-50/40' : ''}`}>
                      <td className="border border-neutral-300 px-1.5 py-0.5 text-center font-medium">{index + 1}</td>
                      <td className="border border-neutral-300 px-2 py-0.5 font-semibold text-black">{item.name}</td>
                      <td className="border border-neutral-300 px-2 py-0.5 text-center font-bold text-black">{item.count} Porsi</td>
                      <td className="border border-neutral-300 px-2 py-0.5 text-center text-neutral-800">{item.percentage}%</td>
                      <td className="border border-neutral-300 px-2 py-0.5 text-[8px] text-neutral-600">{evalBadge}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="border border-neutral-300 px-3 py-4 text-center text-neutral-500">
                    Tidak ada data transaksi pesanan menu pada periode {MONTHS[selectedMonth]} {selectedYear}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BAGIAN III: LEMBAR PENGESAHAN & TANDA TANGAN */}
        <div className="text-[9px] print-avoid-break mt-4 pt-2 border-t border-neutral-200">
          <div className="grid grid-cols-2 text-center gap-6">
            {/* Kolom Kiri: Dietisien */}
            <div className="flex flex-col items-center">
              <p className="text-neutral-600 mb-0.5">Diverifikasi Oleh,</p>
              <p className="font-bold text-black">Dietisien / PJ Pelayanan Gizi</p>
              <div className="h-12"></div>
              <p className="font-bold underline text-black">( .................................................... )</p>
              <p className="text-[8px] text-neutral-500 mt-0.5">NIP / ID: .......................................</p>
            </div>

            {/* Kolom Kanan: Ka. Instalasi */}
            <div className="flex flex-col items-center">
              <p className="text-neutral-600 mb-0.5">Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-black">Kepala Instalasi Gizi & Dietetik</p>
              <div className="h-12"></div>
              <p className="font-bold underline text-black">( .................................................... )</p>
              <p className="text-[8px] text-neutral-500 mt-0.5">NIP: ............................................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
