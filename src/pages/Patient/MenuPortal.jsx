import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ShoppingCart, ShoppingBag, AlertCircle, Info } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import PatientIdentityCard from '../../components/ui/cards/PatientIdentityCard';
import Alert from '../../components/ui/feedback/Alert';
import Accordion from '../../components/ui/data-display/Accordion';
import MenuCard from '../../components/ui/cards/MenuCard';
import SearchBar from '../../components/ui/forms/SearchBar';
import IncludeModal from '../../components/ui/modals/IncludeModal';
import { usePatient } from '../../context/PatientContext';
import PageTransition from '../../components/PageTransition';
import { checkPatientHasOrderedMain } from '../../services/orderService';
import { getAllMenuItems, getMenuItemsByCycle } from '../../services/menuService';
import { getTomorrowServingDate, getTomorrowMenuCycle, getTodayMenuCycle } from '../../utils/cycleHelper';
import { getCurrentWIBHour } from '../../utils/cutoffValidator';
import { secureSessionStorage } from '../../utils/secureStorage';
import appConfig from '../../config/appConfig';

// Format representasi tanggal untuk tampilan pengguna (cth: "Rabu, 28 Okt")
const formatDateDisplay = (dateObj) => {
  if (!dateObj) return '';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
};

// Portal katalog menu: Menu Utama (Include - Siklus Besok T+1) & Menu Ekstra (Berbayar - Pilihan Pasien: Hari Ini / Besok)
export default function MenuPortal() {
  const { patient } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Batas cut-off time diambil dari appConfig (Single Source of Truth) & auto-refresh tiap 1 menit
  const [currentHour, setCurrentHour] = useState(() => getCurrentWIBHour());
  useEffect(() => {
    const timer = setInterval(() => setCurrentHour(getCurrentWIBHour()), 60000);
    return () => clearInterval(timer);
  }, []);
  const isMainMenuLockedTime = appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_MAIN;
  const isExtraSiangLockedTime = appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_EXTRA_SIANG;
  const isExtraSoreLockedTime = appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_EXTRA_SORE;
  const isExtraBesokLockedTime = appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_MAIN;
  const isExtraTodayFullyClosed = isExtraSiangLockedTime && isExtraSoreLockedTime;
  const isExtraAllClosed = isExtraTodayFullyClosed && isExtraBesokLockedTime;

  // Siklus & Objek Tanggal Hari Ini dan Besok (WIB UTC+7)
  const tomorrowCycle = useMemo(() => getTomorrowMenuCycle(), []);
  const todayCycle = useMemo(() => getTodayMenuCycle(), []);
  const todayObj = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3600000 * 7);
  }, []);
  const tomorrowObj = useMemo(() => {
    const d = new Date(todayObj);
    d.setDate(d.getDate() + 1);
    return d;
  }, [todayObj]);

  // Proteksi: alihkan ke login jika data pasien kosong
  useEffect(() => {
    if (!patient || !patient.id || !patient.rmNumber) {
      navigate('/login', { replace: true });
    }
  }, [patient, navigate]);
  
  // Menu Utama selalu menggunakan siklus esok hari (T+1)
  const [tomorrowMenuItems, setTomorrowMenuItems] = useState([]);
  // Menu Ekstra dapat memilih antara siklus Hari Ini atau Besok
  const [todayMenuItems, setTodayMenuItems] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [includeModalOpen, setIncludeModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [validationAlert, setValidationAlert] = useState(null);
  const [hasOrderedMain, setHasOrderedMain] = useState(false);

  // Tab pemilihan jadwal Menu Ekstra: 'HARI_INI' vs 'BESOK'
  // Jika hari ini sudah tutup kedua sesi makannya, otomatis arahkan ke 'BESOK'
  const [extraTargetDay, setExtraTargetDay] = useState(() => isExtraTodayFullyClosed ? 'BESOK' : 'HARI_INI');

  // Pastikan extraTargetDay sinkron jika hari ini sudah tutup
  useEffect(() => {
    if (isExtraTodayFullyClosed && extraTargetDay !== 'BESOK') {
      setExtraTargetDay('BESOK');
    }
  }, [isExtraTodayFullyClosed, extraTargetDay]);
  
  const currentPatientKey = patient?.id || patient?.rmNumber ? String(patient.id || patient.rmNumber) : null;

  const [quantities, setQuantities] = useState(() => {
    if (location.state?.restoredQuantities && Object.keys(location.state.restoredQuantities).length > 0) {
      return location.state.restoredQuantities;
    }
    const saved = secureSessionStorage.getItem('patient_cart_quantities', true);
    const savedOwner = secureSessionStorage.getItem('patient_cart_owner');
    if (saved && savedOwner && currentPatientKey && savedOwner === currentPatientKey) {
      return saved;
    }
    return {};
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Sinkronkan pilihan menu ke session storage hanya jika terhubung ke pasien aktif
  useEffect(() => {
    if (currentPatientKey) {
      secureSessionStorage.setItem('patient_cart_quantities', quantities);
      secureSessionStorage.setItem('patient_cart_owner', currentPatientKey);
    }
  }, [quantities, currentPatientKey]);

  // Bersihkan state pilihan jika pasien berganti
  useEffect(() => {
    const savedOwner = secureSessionStorage.getItem('patient_cart_owner');
    if (savedOwner && currentPatientKey && savedOwner !== currentPatientKey) {
      setQuantities({});
    }
  }, [currentPatientKey]);

  // Ambil hidangan menu untuk siklus esok hari (Menu Utama) dan siklus hari ini + besok (Menu Ekstra)
  useEffect(() => {
    async function fetchMenus() {
      if (!patient?.id) return;
      try {
        setLoading(true);
        
        // Ambil data menu siklus besok (T+1), siklus hari ini (T), dan seluruh menu referensi
        const [tomorrowData, todayData, allData] = await Promise.all([
          getMenuItemsByCycle(tomorrowCycle),
          getMenuItemsByCycle(todayCycle),
          getAllMenuItems()
        ]);

        setTomorrowMenuItems(tomorrowData || []);
        setTodayMenuItems(todayData || []);
        setAllMenuItems(allData || []);

        const fullPool = (allData && allData.length > 0) ? allData : [...(tomorrowData || []), ...(todayData || [])];
        if (fullPool.length > 0) {
          setQuantities(prev => {
            const validIds = new Set(fullPool.map(d => String(d.id)));
            const newQuantities = {};
            for (const [key, val] of Object.entries(prev)) {
              const baseKey = key.startsWith('ekstra_') ? key.replace('ekstra_', '') : key;
              if (validIds.has(String(baseKey))) {
                newQuantities[key] = val;
              }
            }
            return newQuantities;
          });
        }

        // Cek apakah pasien sudah memesan menu utama untuk jadwal besok langsung ke database server
        const targetServingDate = getTomorrowServingDate();
        const hasOrdered = await checkPatientHasOrderedMain(
          patient.id || patient.rmNumber,
          targetServingDate,
          patient.noReg || patient.noreg
        );

        setHasOrderedMain(hasOrdered);

        if (hasOrdered) {
          // Bersihkan item menu utama dari keranjang lokal jika di server sudah tercatat pesanan
          setQuantities(prev => {
            const next = {};
            for (const [key, val] of Object.entries(prev)) {
              if (key.startsWith('ekstra_')) {
                next[key] = val;
              }
            }
            return next;
          });
        }

      } catch (err) {
        console.error("Error fetching menus:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, [patient?.id, patient?.rmNumber, patient?.noReg, patient?.noreg, tomorrowCycle, todayCycle]);

  if (!patient || !patient.id || !patient.rmNumber) return null;

  const displayPatient = patient;

  // Kuota porsi: VIP A ke atas (termasuk VVIP & Suite, mengikuti kelas titipan/efektif) dapat 2 porsi untuk siang & sore
  const roomClassLower = (displayPatient.effectiveClass || displayPatient.roomClass || '').toLowerCase();
  const isVip = roomClassLower.includes('vip a') || roomClassLower.includes('vip_a') || roomClassLower.includes('vvip') || roomClassLower.includes('suite');
  
  const maxQtyPagi = 2;
  const maxQtySiang = isVip ? 2 : 1;
  const maxQtySore = isVip ? 2 : 1;

  // Atur jumlah porsi Menu Utama (buka modal pilihan jika kuota > 1)
  const handleQuantityChange = (item, val, sessionMaxQty) => {
    const currentQtyArr = quantities[item.id] || [];
    const currentQty = currentQtyArr.length;

    if (val > currentQty) {
      if (sessionMaxQty > 1) {
        setIncludeModalOpen(true);
        setSelectedCardId(item.id);
      } else {
        setQuantities(prev => ({
          ...prev,
          [item.id]: [...(prev[item.id] || []), 'PASIEN']
        }));
      }
    } else if (val < currentQty) {
      setQuantities(prev => {
        const arr = prev[item.id] || [];
        return {
          ...prev,
          [item.id]: arr.slice(0, -1)
        };
      });
    }
  };

  // Simpan peruntukan porsi (Pasien / Pendamping) dari modal
  const handleIncludeModalSave = (consumerRole) => {
    const itemId = selectedCardId;
    setQuantities(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), consumerRole]
    }));
    setIncludeModalOpen(false);
    setSelectedCardId(null);
  };

  // Ubah porsi menu ekstra untuk target day terpilih ('HARI_INI' atau 'BESOK')
  const handleEkstraQuantityChange = (item, val, targetDay) => {
    const itemId = `ekstra_${item.id}`;
    const currentQty = (quantities[itemId] || []).filter(c => c === targetDay).length;
    
    if (val > currentQty) {
      const isSiang = item.mealTime?.toUpperCase() === 'SIANG';
      if (targetDay === 'HARI_INI') {
        if (isSiang && isExtraSiangLockedTime) {
          setValidationAlert(`Batas waktu pemesanan makan siang hari ini telah habis (${appConfig.CUTOFF_EXTRA_SIANG_TEXT}).`);
          return;
        }
        if (!isSiang && isExtraSoreLockedTime) {
          setValidationAlert(`Batas waktu pemesanan makan sore hari ini telah habis (${appConfig.CUTOFF_EXTRA_SORE_TEXT}).`);
          return;
        }
      } else if (targetDay === 'BESOK') {
        if (isExtraBesokLockedTime) {
          setValidationAlert(`Batas waktu pemesanan menu ekstra untuk besok telah habis (${appConfig.CUTOFF_MAIN_TEXT}).`);
          return;
        }
      }

      setQuantities(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), targetDay]
      }));
    } else if (val < currentQty) {
      setQuantities(prev => {
        const arr = prev[itemId] || [];
        const lastIdx = arr.lastIndexOf(targetDay);
        if (lastIdx === -1) return prev;
        const nextArr = [...arr];
        nextArr.splice(lastIdx, 1);
        if (nextArr.length === 0) {
          const next = { ...prev };
          delete next[itemId];
          return next;
        }
        return {
          ...prev,
          [itemId]: nextArr
        };
      });
    }
  };

  // Menu Utama selalu berasal dari siklus besok (T+1)
  const menuPagi = tomorrowMenuItems.filter(item => item.mealTime?.toUpperCase() === 'PAGI');
  const menuSiang = tomorrowMenuItems.filter(item => item.mealTime?.toUpperCase() === 'SIANG');
  const menuSore = tomorrowMenuItems.filter(item => item.mealTime?.toUpperCase() === 'SORE');

  // Menu Ekstra berasal dari siklus yang dipilih pasien (Hari Ini vs Besok)
  const currentEkstraPool = extraTargetDay === 'HARI_INI' ? todayMenuItems : tomorrowMenuItems;
  const ekstraSiang = currentEkstraPool.filter(item => item.mealTime?.toUpperCase() === 'SIANG');
  const ekstraSore = currentEkstraPool.filter(item => item.mealTime?.toUpperCase() === 'SORE');

  // Filter pencarian menu ekstra
  const filteredEkstraSiang = ekstraSiang.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredEkstraSore = ekstraSore.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render daftar Menu Utama (dengan sisa kuota sesi dinamis)
  const renderMenuGrid = (items, maxSessionQty) => {
    if (loading) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Menyiapkan menu...</div>;
    if (error) return <div className="p-3 text-sm text-danger-500 italic bg-danger-50 rounded-lg border border-danger-100 mt-2">Gagal memuat menu. Silakan muat ulang halaman.</div>;
    if (items.length === 0) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Menu belum tersedia.</div>;

    const totalUsedQty = items.reduce((sum, item) => sum + (quantities[item.id]?.length || 0), 0);
    const remainingQty = maxSessionQty - totalUsedQty;

    return (
      <div className="flex sm:grid sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-4 overflow-x-auto pb-4 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map(item => {
          const currentQty = quantities[item.id]?.length || 0;
          const dynamicMaxQty = currentQty + remainingQty;

          return (
            <div key={`wrap-${item.id}`} className="min-w-[160px] w-[45vw] sm:w-auto sm:min-w-0 snap-start shrink-0 flex">
              <div className="w-full">
                <MenuCard 
                  key={item.id}
                  type="paket"
                  subtitle={item.paketName || 'Paket'}
                  title={item.name}
                  description={item.description}
                  quantity={currentQty}
                  maxQuantity={dynamicMaxQty}
                  sessionMaxQuantity={maxSessionQty}
                  onQuantityChange={(val) => handleQuantityChange(item, val, maxSessionQty)}
                  image={item.image || item.imageUrl}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render daftar Menu Ekstra berbayar
  const renderEkstraGrid = (items, isMealLocked = false) => {
    if (loading) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Menyiapkan menu ekstra...</div>;
    if (error) return <div className="p-3 text-sm text-danger-500 italic bg-danger-50 rounded-lg border border-danger-100 mt-2">Gagal memuat menu. Silakan muat ulang halaman.</div>;
    if (items.length === 0) return <div className="p-3 text-sm text-neutral-500 italic bg-white rounded-lg border border-neutral-100 mt-2">Menu ekstra belum tersedia.</div>;
    return (
      <div className="flex sm:grid sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-4 overflow-x-auto pb-4 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map(item => {
          const itemId = `ekstra_${item.id}`;
          const currentQty = (quantities[itemId] || []).filter(c => c === extraTargetDay).length;
          const maxQty = isMealLocked ? currentQty : Infinity;

          return (
            <div key={`ekstra-wrap-${extraTargetDay}-${item.id}`} className="min-w-[160px] w-[45vw] sm:w-auto sm:min-w-0 snap-start shrink-0 flex">
              <div className="w-full">
                <MenuCard 
                  key={`ekstra-card-${extraTargetDay}-${item.id}`}
                  type="extra"
                  subtitle={item.paketName || 'Paket'}
                  title={item.name}
                  description={item.description}
                  price="Rp 15.000"
                  quantity={currentQty}
                  maxQuantity={maxQty}
                  onQuantityChange={(val) => handleEkstraQuantityChange(item, val, extraTargetDay)}
                  image={item.image || item.imageUrl}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalItems = Object.values(quantities).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);

  // Validasi item & cut-off time sebelum lanjut ke halaman ringkasan (/cart)
  const handleProceedToCart = () => {
    if (totalItems === 0) {
      if (!hasOrderedMain) {
        setValidationAlert(`Mohon pilih minimal 1 menu untuk dipesan.`);
      } else {
        setValidationAlert(`Silakan pilih menu ekstra terlebih dahulu.`);
      }
      return;
    }

    let invalidLock = null;
    const pool = (allMenuItems && allMenuItems.length > 0) ? allMenuItems : [...tomorrowMenuItems, ...todayMenuItems];

    Object.entries(quantities).forEach(([key, consumers]) => {
      if (!consumers || consumers.length === 0) return;
      
      if (key.startsWith('ekstra_')) {
        const baseKey = key.replace('ekstra_', '');
        const item = pool.find(m => String(m.id) === String(baseKey));
        if (item) {
          const mealTime = item.mealTime?.toUpperCase();
          const hasHariIni = consumers.includes('HARI_INI');
          const hasBesok = consumers.some(c => c === 'BESOK' || c === 'EKSTRA');

          if (hasHariIni) {
            if (mealTime === 'SIANG' && isExtraSiangLockedTime) {
              invalidLock = `Ekstra Hari Ini Siang (maks ${appConfig.CUTOFF_EXTRA_SIANG_TEXT})`;
            }
            if (mealTime === 'SORE' && isExtraSoreLockedTime) {
              invalidLock = `Ekstra Hari Ini Sore (maks ${appConfig.CUTOFF_EXTRA_SORE_TEXT})`;
            }
          }
          if (hasBesok && isExtraBesokLockedTime) {
            invalidLock = `Ekstra Besok (maks ${appConfig.CUTOFF_MAIN_TEXT})`;
          }
        }
      } else {
        if (isMainMenuLockedTime) invalidLock = `Menu Utama (maks ${appConfig.CUTOFF_MAIN_TEXT})`;
      }
    });

    if (invalidLock) {
      setValidationAlert(`Batas waktu pemesanan untuk ${invalidLock} telah habis.`);
      return;
    }

    navigate('/cart', { state: { quantities, menuItems: pool, hasOrderedMain } });
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative bg-transparent flex flex-col font-sans text-neutral-900 pt-[60px] pb-24">

      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-neutral-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col gap-1">
              <span className="font-bold text-neutral-900 leading-tight">Menu Gizi</span>
              <span className="text-[11px] text-neutral-500 font-normal leading-tight">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 z-10 relative pb-8 w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        <PatientIdentityCard 
          name={displayPatient.name}
          rmNumber={displayPatient.rmNumber?.replace('RM-', '')}
          room={displayPatient.roomName?.replace('Kamar ', '')}
          roomClass={displayPatient.roomClass}
        />

        {!hasOrderedMain && !isMainMenuLockedTime && (
          <Alert 
            variant="danger" 
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          >
            Batas order menu utama pukul {appConfig.CUTOFF_MAIN_TEXT} untuk penyajian esok hari.
          </Alert>
        )}

        {/* 1. Bagian Menu Utama (Siklus Besok T+1) */}
        {hasOrderedMain || isMainMenuLockedTime ? (
          <div className="bg-white shadow-xs border border-neutral-200 border-l-[4px] border-l-primary-600 rounded-xl p-4 flex items-center gap-3 my-4">
            <div className="bg-primary-50 p-2 rounded-full">
              <Info size={20} className="text-primary-600" />
            </div>
            <span className="text-sm font-bold text-neutral-700">
              {hasOrderedMain ? "Menu utama sudah dipesan" : `Batas waktu pemesanan menu utama habis (${appConfig.CUTOFF_MAIN_TEXT})`}
            </span>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-primary-500" />
                <h2 className="text-lg md:text-xl font-bold text-neutral-900">Menu Utama</h2>
              </div>
            </div>

            <Accordion 
              title="Makan Pagi" 
              iconBg="bg-primary-50"
              iconColor="text-neutral-600"
              defaultExpanded={true}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            >
              {renderMenuGrid(menuPagi, maxQtyPagi)}
            </Accordion>

            <Accordion 
              title="Makan Siang" 
              iconBg="bg-warning-50"
              iconColor="text-warning-700"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            >
              {renderMenuGrid(menuSiang, maxQtySiang)}
            </Accordion>

            <Accordion 
              title="Makan Sore" 
              iconBg="bg-neutral-700"
              iconColor="text-white"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            >
              {renderMenuGrid(menuSore, maxQtySore)}
            </Accordion>
          </div>
        )}

        {/* 2. Bagian Menu Ekstra Berbayar */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary-500" />
              <h2 className="text-lg md:text-xl font-bold text-neutral-900">Ekstra</h2>
            </div>
            {!isExtraAllClosed && isExtraTodayFullyClosed && (
              <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                Penyajian Besok
              </span>
            )}
          </div>

          {isExtraAllClosed ? (
            <div className="bg-white shadow-xs border border-neutral-200 border-l-[4px] border-l-primary-600 rounded-xl p-4 flex items-center gap-3 my-2">
              <div className="bg-primary-50 p-2 rounded-full">
                <Info size={20} className="text-primary-600" />
              </div>
              <span className="text-sm font-bold text-neutral-700">
                Batas waktu pemesanan menu ekstra habis ({appConfig.CUTOFF_MAIN_TEXT})
              </span>
            </div>
          ) : (
            <>
              {/* Selector Jadwal Penyajian Ekstra: Hanya tampil jika Hari Ini MASIH BUKA */}
              {!isExtraTodayFullyClosed && (
                <div className="space-y-2">
                  <div className="flex bg-neutral-100/90 p-1 rounded-xl gap-1 border border-neutral-200/70">
                    {/* Tab Hari Ini */}
                    <button
                      type="button"
                      onClick={() => setExtraTargetDay('HARI_INI')}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer border-0 outline-none flex flex-col items-center justify-center gap-0.5 ${
                        extraTargetDay === 'HARI_INI'
                          ? 'bg-white text-primary-700 shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-800 font-medium'
                      }`}
                    >
                      <span className="text-sm leading-tight">Hari Ini</span>
                      <span className="text-[11px] font-normal opacity-75 leading-tight">
                        {formatDateDisplay(todayObj)}
                      </span>
                    </button>

                    {/* Tab Besok */}
                    <button
                      type="button"
                      onClick={() => setExtraTargetDay('BESOK')}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer border-0 outline-none flex flex-col items-center justify-center gap-0.5 ${
                        extraTargetDay === 'BESOK'
                          ? 'bg-white text-primary-700 shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-800 font-medium'
                      }`}
                    >
                      <span className="text-sm leading-tight">Besok</span>
                      <span className="text-[11px] font-normal opacity-75 leading-tight">
                        {formatDateDisplay(tomorrowObj)}
                      </span>
                    </button>
                  </div>

                  {/* Keterangan Batas Waktu Ringkas */}
                  {extraTargetDay === 'HARI_INI' ? (
                    isExtraSiangLockedTime ? (
                      <div className="flex items-center gap-2 text-xs text-warning-800 bg-warning-50/80 border border-warning-200 px-3 py-2 rounded-xl">
                        <AlertCircle size={15} className="text-warning-600 shrink-0" />
                        <span>Makan Siang telah ditutup ({appConfig.CUTOFF_EXTRA_SIANG_TEXT}). Makan Sore buka hingga {appConfig.CUTOFF_EXTRA_SORE_TEXT}.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 px-1 pt-0.5">
                        <Info size={14} className="text-primary-600 shrink-0" />
                        <span>Batas order Hari Ini: Siang maks {appConfig.CUTOFF_EXTRA_SIANG_TEXT}, Sore maks {appConfig.CUTOFF_EXTRA_SORE_TEXT}.</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 px-1 pt-0.5">
                      <Info size={14} className="text-primary-600 shrink-0" />
                      <span>Batas order menu ekstra untuk penyajian esok hari pukul {appConfig.CUTOFF_MAIN_TEXT}.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Jika Hari Ini sudah tutup total (antara 14:00 - 15:00), tampilkan info ringkas bahwa yang tersedia hanya Besok */}
              {isExtraTodayFullyClosed && (
                <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl">
                  <Info size={15} className="text-primary-600 shrink-0" />
                  <span>Pemesanan ekstra hari ini telah berakhir. Saat ini melayani pemesanan untuk <strong>penyajian besok</strong> (maksimal pukul {appConfig.CUTOFF_MAIN_TEXT}).</span>
                </div>
              )}

              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari menu ekstra ${extraTargetDay === 'HARI_INI' ? 'hari ini' : 'besok'}...`}
              />

              <Accordion 
                title="Makan Siang" 
                iconBg="bg-warning-50"
                iconColor="text-warning-700"
                defaultExpanded={extraTargetDay === 'HARI_INI' ? !isExtraSiangLockedTime : true}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              >
                {extraTargetDay === 'HARI_INI' && isExtraSiangLockedTime ? (
                  <div className="p-3 text-xs text-neutral-500 italic bg-neutral-50 rounded-lg border border-neutral-200 mt-2">
                    Batas pemesanan makan siang hari ini telah ditutup ({appConfig.CUTOFF_EXTRA_SIANG_TEXT}).
                  </div>
                ) : (
                  renderEkstraGrid(
                    filteredEkstraSiang,
                    extraTargetDay === 'HARI_INI' ? isExtraSiangLockedTime : isExtraBesokLockedTime
                  )
                )}
              </Accordion>

              <Accordion 
                title="Makan Sore" 
                iconBg="bg-neutral-700"
                iconColor="text-white"
                defaultExpanded={extraTargetDay === 'HARI_INI' ? isExtraSiangLockedTime && !isExtraSoreLockedTime : false}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                }
              >
                {extraTargetDay === 'HARI_INI' && isExtraSoreLockedTime ? (
                  <div className="p-3 text-xs text-neutral-500 italic bg-neutral-50 rounded-lg border border-neutral-200 mt-2">
                    Batas pemesanan makan sore hari ini telah ditutup ({appConfig.CUTOFF_EXTRA_SORE_TEXT}).
                  </div>
                ) : (
                  renderEkstraGrid(
                    filteredEkstraSore,
                    extraTargetDay === 'HARI_INI' ? isExtraSoreLockedTime : isExtraBesokLockedTime
                  )
                )}
              </Accordion>
            </>
          )}
        </div>

      </div>

      {/* Hitung peran konsumen (Pasien/Pendamping) yang sudah dipilih pada sesi makan yang sama (Menu Utama) */}
      {(() => {
        let takenRoles = [];
        if (selectedCardId && includeModalOpen) {
          const selectedItem = tomorrowMenuItems.find(m => m.id === selectedCardId);
          if (selectedItem) {
            const mealTime = selectedItem.mealTime;
            const sameMealItems = tomorrowMenuItems.filter(m => m.mealTime === mealTime);
            sameMealItems.forEach(m => {
              const roles = quantities[m.id] || [];
              takenRoles = [...takenRoles, ...roles];
            });
          }
        }
        
        return (
          <IncludeModal 
            isOpen={includeModalOpen}
            onClose={() => {
              setIncludeModalOpen(false);
              setSelectedCardId(null);
            }}
            itemData={selectedCardId ? tomorrowMenuItems.find(m => m.id === selectedCardId) : null}
            onSave={handleIncludeModalSave}
            takenRoles={takenRoles}
          />
        );
      })()}

      {validationAlert && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setValidationAlert(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white w-full max-w-[320px] rounded-2xl p-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-14 h-14 bg-warning-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-warning-500" />
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Lengkapi Pesanan
            </h3>
            
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              {validationAlert}
            </p>
            
            <button
              onClick={() => setValidationAlert(null)}
              className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary-700 active:scale-[0.98] transition-all outline-none focus:outline-none border-none ring-0 cursor-pointer"
            >
              Oke, Mengerti
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Bilah keranjang mengapung (Floating Cart) jika ada item dipilih */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-primary-700 text-white rounded-2xl shadow-xl z-40 p-3.5 sm:px-6 sm:py-4 flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="relative ml-1">
              <ShoppingBag size={24} className="text-white opacity-90" />
              <span className="absolute -top-2.5 -right-2.5 bg-danger-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-primary-700 shadow-xs">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col ml-1">
              <span className="font-bold text-base leading-tight">{totalItems} Item</span>
              <span className="text-xs text-white/80 font-normal mt-0.5">Item terpilih</span>
            </div>
          </div>
          
          <button 
            onClick={handleProceedToCart}
            className="bg-white text-primary-700 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center gap-1.5 border-0 outline-none cursor-pointer"
          >
            Lanjut ke Ringkasan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
