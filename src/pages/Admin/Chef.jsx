import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, AlertCircle, FileText, ChefHat, UtensilsCrossed, Info, X
} from 'lucide-react';
import { getOrders } from '../../services/orderService';
import { getMenuItemsByCycle } from '../../services/menuService';
import { supabase } from '../../utils/supabase';
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
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

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
    const subscription = supabase
      .channel('public:Order')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order' }, () => {
        fetchChefData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
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
        addStat('Karbohidrat', matchedMenu.karbohidrat);
        addStat('Protein Hewani', matchedMenu.protein);
        addStat('Sayur', matchedMenu.sayur);
        addStat('Protein Nabati', matchedMenu.nabati);
        addStat('Protein Tambahan', matchedMenu.proteinTambahan);
      } else {
        // Fallback for Ekstra / Unmatched items
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
  }, [filteredDailyOrders, menuItems]);

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
              Ringkasan total bahan dan porsi secara keseluruhan (Pagi, Siang, Sore & Ekstra).
            </p>
            <button 
              onClick={() => setIsNotesModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 text-warning-800 hover:bg-warning-100 rounded-lg text-sm font-bold transition-colors border border-warning-200"
            >
              Lihat Catatan
              {chefStats?.notes?.length > 0 && (
                <span className="bg-warning-200 text-warning-900 px-1.5 rounded-full text-xs ml-1">
                  {chefStats.notes.length}
                </span>
              )}
            </button>
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
        ) : !hasAnyData ? (
          <div className="w-full bg-white rounded-xl border border-neutral-200 p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3">
            <UtensilsCrossed className="w-12 h-12 text-neutral-300 mb-2" />
            <h3 className="text-lg font-bold text-neutral-700">Belum Ada Data Produksi</h3>
            <p className="text-sm text-neutral-500 max-w-sm">
              Belum ada pesanan yang terdaftar untuk jadwal penyajian besok hari.
            </p>
          </div>
        ) : (
          <div className="space-y-6">


            {/* Unified 5-Column Table */}
            <div className="bg-white mb-8 overflow-hidden" style={{ border: '1px solid #9ca3af' }}>
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
          </div>
        )}

        {/* Modal Catatan & Alergi */}
        {isNotesModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm transition-all"
            onClick={() => setIsNotesModalOpen(false)}
          >
            <div 
              className="bg-white w-full max-w-xl max-h-[75vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 bg-white">
                <h3 className="font-bold text-neutral-900 text-lg">
                  Catatan Penting & Alergi
                </h3>
              </div>
              
              <div className="px-5 pb-5 overflow-y-auto bg-white">
                {chefStats.notes.length === 0 ? (
                  <p className="text-center text-neutral-500 py-6 text-sm">Tidak ada catatan untuk hari ini.</p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {chefStats.notes.map((n, idx) => (
                      <li key={idx} className="py-3.5 flex gap-4 items-start">
                        <span className="text-xs font-bold text-neutral-500 w-14 pt-0.5">{n.mealTime}</span>
                        <div className="text-sm text-neutral-800 flex-1">
                          <p className="font-semibold mb-0.5 text-base">{n.menu}</p>
                          {n.allergy && (
                            <p className="text-danger-600 mt-0.5 text-sm">
                              <span className="font-bold">Alergi:</span> {n.allergy}
                            </p>
                          )}
                          {n.note && (
                            <p className="text-neutral-600 italic mt-0.5 text-sm">
                              "{n.note}"
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="px-5 py-3.5 bg-white flex justify-end border-t border-neutral-100">
                <button 
                  onClick={() => setIsNotesModalOpen(false)}
                  className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
