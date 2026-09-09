import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, User, Users, Sun, Cloud, Moon, ShoppingBag, Loader2 } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import { usePatient } from '../../context/PatientContext';
import { createOrders } from '../../services/orderService';

// Time schedule labels
const MEAL_SCHEDULE = {
  PAGI: { label: 'Pagi', time: '06:30 - 08:30 WIB', icon: Sun },
  SIANG: { label: 'Siang', time: '11:30 - 13:30 WIB', icon: Cloud },
  MALAM: { label: 'Malam', time: '17:30 - 19:30 WIB', icon: Moon },
  SORE: { label: 'Malam', time: '17:30 - 19:30 WIB', icon: Moon },
};

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, logoutPatient } = usePatient();
  const [note, setNote] = useState(() => {
    return sessionStorage.getItem('patient_cart_note') || '';
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save note to sessionStorage whenever it changes
  React.useEffect(() => {
    sessionStorage.setItem('patient_cart_note', note);
  }, [note]);

  // Retrieve data passed from MenuPortal
  const { quantities = {}, menuItems = [] } = location.state || {};

  // If no data, redirect back
  if (!quantities || Object.keys(quantities).length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag size={48} className="text-neutral-300 mb-4" />
        <h2 className="text-lg font-bold text-neutral-700 mb-2">Keranjang Kosong</h2>
        <p className="text-sm text-neutral-500 mb-6">Belum ada menu yang dipilih. Silakan pilih menu terlebih dahulu.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-[#004e8c] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#003d6f] transition-colors"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  // Build a lookup map for menu items
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach(item => { map[item.id] = item; });
    return map;
  }, [menuItems]);

  // Process quantities into structured order data
  const orderData = useMemo(() => {
    const pasien = { PAGI: [], SIANG: [], MALAM: [] };
    const pendamping = { PAGI: [], SIANG: [], MALAM: [] };
    const ekstra = { SIANG: [], MALAM: [] };

    Object.entries(quantities).forEach(([key, consumers]) => {
      if (!consumers || consumers.length === 0) return;

      const isEkstra = key.startsWith('ekstra_');
      const itemId = isEkstra ? key.replace('ekstra_', '') : key;
      const item = menuMap[itemId];
      if (!item) return;

      const mealTime = item.mealTime?.toUpperCase();
      // Normalize SORE to MALAM
      const normalizedMealTime = mealTime === 'SORE' ? 'MALAM' : mealTime;

      if (isEkstra) {
        // All ekstra items go into the ekstra section
        const count = consumers.length;
        if (count > 0 && ekstra[normalizedMealTime]) {
          ekstra[normalizedMealTime].push({
            item,
            qty: count,
            paketName: item.paketName || 'Paket',
          });
        }
      } else {
        // Split by consumer role
        const pasienCount = consumers.filter(c => c === 'PASIEN').length;
        const pendampingCount = consumers.filter(c => c === 'PENDAMPING').length;

        if (pasienCount > 0 && pasien[normalizedMealTime]) {
          pasien[normalizedMealTime].push({
            item,
            qty: pasienCount,
            paketName: item.paketName || 'Paket',
          });
        }
        if (pendampingCount > 0 && pendamping[normalizedMealTime]) {
          pendamping[normalizedMealTime].push({
            item,
            qty: pendampingCount,
            paketName: item.paketName || 'Paket',
          });
        }
      }
    });

    return { pasien, pendamping, ekstra };
  }, [quantities, menuMap]);

  // Check if sections have items
  const hasPasienItems = Object.values(orderData.pasien).some(arr => arr.length > 0);
  const hasPendampingItems = Object.values(orderData.pendamping).some(arr => arr.length > 0);
  const hasEkstraItems = Object.values(orderData.ekstra).some(arr => arr.length > 0);

  // Render a meal time section
  const renderMealSection = (mealTimeKey, items, showIncludedBadge = true) => {
    if (items.length === 0) return null;
    const schedule = MEAL_SCHEDULE[mealTimeKey] || MEAL_SCHEDULE.PAGI;
    const IconComponent = schedule.icon;

    return (
      <div key={mealTimeKey} className="mb-4 last:mb-0">
        {/* Meal time header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <IconComponent size={16} className="text-[#004e8c]" />
            </div>
            <div>
              <p className="font-bold text-sm text-neutral-800">{schedule.label}</p>
              <p className="text-[11px] text-neutral-400">{schedule.time}</p>
            </div>
          </div>
          {showIncludedBadge && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Included
            </span>
          )}
        </div>

        {/* Items */}
        <div className="pl-[42px] space-y-1.5">
          {items.map((entry, idx) => (
            <div key={`${entry.item.id}-${idx}`}>
              <p className="text-sm font-semibold text-neutral-700">
                {entry.qty}x {entry.paketName}
              </p>
              <p className="text-xs text-neutral-400">{entry.item.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render ekstra meal section with price badge
  const renderEkstraMealSection = (mealTimeKey, items) => {
    if (items.length === 0) return null;
    const schedule = MEAL_SCHEDULE[mealTimeKey] || MEAL_SCHEDULE.SIANG;
    const IconComponent = schedule.icon;

    return (
      <div key={`ekstra-${mealTimeKey}`} className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
              <IconComponent size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-neutral-800">{schedule.label}</p>
              <p className="text-[11px] text-neutral-400">{schedule.time}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            Berbayar
          </span>
        </div>

        <div className="pl-[42px] space-y-1.5">
          {items.map((entry, idx) => (
            <div key={`ekstra-${entry.item.id}-${idx}`}>
              <p className="text-sm font-semibold text-neutral-700">
                {entry.qty}x {entry.paketName}
              </p>
              <p className="text-xs text-neutral-400">{entry.item.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const orderItemsToInsert = [];
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `ORD-${dateStr}-${randomStr}`;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const date = String(tomorrow.getDate()).padStart(2, '0');
      const servingDateISO = `${year}-${month}-${date}T00:00:00.000Z`;

      // Helper function to generate UUID (fallback for mobile/HTTP environments)
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const addItems = (type, consumer, mealTimeKey, itemsArr) => {
        itemsArr.forEach(entry => {
          orderItemsToInsert.push({
            id: generateUUID(),
            orderCode,
            patientId: patient.id,
            roomNumber: patient.roomName,
            classType: patient.roomClass,
            menuName: entry.item.name,
            paketName: entry.paketName || null,
            mealTime: mealTimeKey,
            servingDate: servingDateISO,
            quantity: entry.qty,
            type: type,
            consumer: consumer,
            notes: note || null
          });
        });
      };

      const roomClassLower = patient.roomClass?.toLowerCase() || '';
      const isVip = roomClassLower.includes('vip a') || roomClassLower.includes('suite');

      ['PAGI', 'SIANG', 'MALAM'].forEach(key => {
        const dbMealTime = key === 'MALAM' ? 'SORE' : key;
        const pasienItems = orderData.pasien[key] || [];
        const pendampingItems = orderData.pendamping[key] || [];
        
        const totalOrdered = pasienItems.reduce((sum, entry) => sum + entry.qty, 0) + 
                             pendampingItems.reduce((sum, entry) => sum + entry.qty, 0);

        if (totalOrdered === 0) {
          // If the user ordered 0 portions for this session, add a Default Menu
          let quota = 1;
          if (key === 'PAGI') quota = 2;
          if (key === 'SIANG') quota = isVip ? 2 : 1;
          if (key === 'MALAM') quota = isVip ? 2 : 1;

          orderItemsToInsert.push({
            id: generateUUID(),
            orderCode,
            patientId: patient.id,
            roomNumber: patient.roomName,
            classType: patient.roomClass,
            menuName: "Menu Default (Ditentukan Ahli Gizi)",
            paketName: "Paket Default",
            mealTime: dbMealTime,
            servingDate: servingDateISO,
            quantity: quota,
            type: 'INCLUDE',
            consumer: 'PASIEN',
            notes: note || null
          });
        } else {
          if (pasienItems.length > 0) addItems('INCLUDE', 'PASIEN', dbMealTime, pasienItems);
          if (pendampingItems.length > 0) addItems('INCLUDE', 'PENDAMPING', dbMealTime, pendampingItems);
        }
      });

      ['SIANG', 'MALAM'].forEach(key => {
        const dbMealTime = key === 'MALAM' ? 'SORE' : key;
        if (orderData.ekstra[key]) addItems('EXCLUDE', 'PASIEN', dbMealTime, orderData.ekstra[key]);
      });

      await createOrders(orderItemsToInsert);

      // Clear the saved note upon successful submission
      sessionStorage.removeItem('patient_cart_note');

      // Create summary for receipt based on exactly what was inserted
      const summaryMap = {};
      orderItemsToInsert.forEach(entry => {
         const keyName = entry.paketName || entry.menuName;
         if (!summaryMap[keyName]) {
           summaryMap[keyName] = { name: keyName, qty: 0 };
         }
         summaryMap[keyName].qty += entry.quantity;
      });
      const summary = Object.values(summaryMap);

      navigate('/order-success', { state: { summary } });
    } catch (error) {
      alert(`Terjadi kesalahan saat menyimpan pesanan: ${error.message || 'Silakan coba lagi.'}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 flex flex-col font-sans text-neutral-900 pt-[60px] pb-8">
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-blue-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-pink-200/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col">
              <span>Menu Gizi</span>
              <span className="text-[10px] font-normal text-neutral-400 -mt-0.5">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
          onLogout={() => {
            logoutPatient();
            navigate('/login');
          }}
        />
      </div>

      {/* Main Content - Centered */}
      <div className="w-full max-w-4xl mx-auto px-4 py-4 relative z-10">
        
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-1">
          <button 
            onClick={() => navigate('/menu', { state: { restoredQuantities: quantities } })}
            className="flex items-center justify-center bg-transparent border-none outline-none p-0 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={20} strokeWidth={2.5} className="text-neutral-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Konfirmasi Pesanan</h1>
            <p className="text-xs text-neutral-400 -mt-0.5">Periksa kembali menu sebelum dikirim</p>
          </div>
        </div>

        {/* Pesanan Pasien */}
        {hasPasienItems && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-[#004e8c]" />
              <h2 className="text-base font-bold text-[#004e8c]">Pesanan Pasien</h2>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              {['PAGI', 'SIANG', 'MALAM'].map(key => 
                renderMealSection(key, orderData.pasien[key])
              )}
            </div>
          </div>
        )}

        {/* Pesanan Pendamping */}
        {hasPendampingItems && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-[#004e8c]" />
              <h2 className="text-base font-bold text-[#004e8c]">Pesanan Pendamping</h2>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              {['PAGI', 'SIANG', 'MALAM'].map(key => 
                renderMealSection(key, orderData.pendamping[key])
              )}
            </div>
          </div>
        )}

        {/* Pesanan Ekstra */}
        {hasEkstraItems && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={18} className="text-amber-600" />
              <h2 className="text-base font-bold text-amber-600">Pesanan Ekstra</h2>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              {['SIANG', 'MALAM'].map(key => 
                renderEkstraMealSection(key, orderData.ekstra[key])
              )}
            </div>
          </div>
        )}

        {/* Catatan Khusus */}
        <div className="mt-5">
          <h2 className="text-base font-bold text-neutral-800 mb-3">Catatan Khusus</h2>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: tanpa pedas, porsi kecil, dll."
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#004e8c]/20 focus:border-[#004e8c]/50 resize-none transition-all"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Catatan ini berlaku untuk seluruh pesanan dalam satu kali checkout.
            </p>
          </div>
        </div>

        {/* Confirm Button - Inline Scrollable */}
        <div className="mt-8">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-[#004e8c] text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-[#003d6f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none outline-none"
          >
            <Send size={18} className="rotate-45" />
            Konfirmasi & Kirim Pesanan
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-[320px] rounded-[24px] p-6 text-center shadow-xl">
            <div className="mx-auto w-14 h-14 bg-[#eef4f9] rounded-full flex items-center justify-center mb-5">
              <Send size={24} className="text-[#004e8c] rotate-45 -ml-1 mt-1" />
            </div>
            
            <h3 className="text-lg font-bold text-[#1a202c] mb-2.5">
              Kirim Pesanan Sekarang?
            </h3>
            
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              Pastikan menu yang Anda pilih sudah sesuai. Pesanan yang telah dikirim tidak dapat diubah kembali.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleConfirm()}
                disabled={isSubmitting}
                className="w-full bg-[#004e8c] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#003d6f] transition-colors outline-none focus:outline-none border-none ring-0 disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  'Ya, Kirim Sekarang'
                )}
              </button>
              
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="w-full bg-white text-[#004e8c] font-semibold py-3 rounded-full text-sm border border-solid border-[#004e8c] hover:bg-[#f8fafc] transition-colors outline-none focus:outline-none ring-0 disabled:opacity-50"
              >
                Periksa Kembali
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
