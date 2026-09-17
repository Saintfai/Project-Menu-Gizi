/**
 * NAMA FILE: Cart.jsx
 * FUNGSI UTAMA: Halaman antarmuka interaktif untuk Pasien Rawat Inap.
 * 
 * DETAIL:
 * - Memungkinkan pasien untuk memverifikasi identitas, melihat menu, dan memesan makanan.
 * - Didesain dengan pendekatan yang ramah pengguna dan aksesibel.
 */
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, User, Users, Sun, Cloud, Moon, ShoppingBag, Loader2, Info, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import { usePatient } from '../../context/PatientContext';
import { createOrders, getOrders } from '../../services/orderService';
import PageTransition from '../../components/PageTransition';
import { validateNote } from '../../utils/inputValidator';
import { secureSessionStorage } from '../../utils/secureStorage';
import { getCurrentWIBHour } from '../../utils/cutoffValidator';

const MEAL_SCHEDULE = {
  PAGI: { label: 'Pagi', time: '06:30 - 08:30 WIB', icon: Sun },
  SIANG: { label: 'Siang', time: '11:30 - 13:30 WIB', icon: Cloud },
  SORE: { label: 'Sore', time: '17:30 - 19:30 WIB', icon: Moon },
};

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, logoutPatient } = usePatient();
  const [note, setNote] = useState(() => {
    return secureSessionStorage.getItem('patient_cart_note') || '';
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalState, setErrorModalState] = useState({ isOpen: false, title: '', message: '' });

  React.useEffect(() => {
    secureSessionStorage.setItem('patient_cart_note', note);
  }, [note]);

  const { quantities = {}, menuItems = [], hasOrderedMain = false } = location.state || {};

  if (!quantities || Object.keys(quantities).length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag size={48} className="text-neutral-300 mb-4" />
        <h2 className="text-lg font-bold text-neutral-700 mb-2">Keranjang Kosong</h2>
        <p className="text-sm text-neutral-500 mb-6">Belum ada menu yang dipilih. Silakan pilih menu terlebih dahulu.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-700 transition-colors cursor-pointer border-none outline-none"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach(item => { map[item.id] = item; });
    return map;
  }, [menuItems]);

  const orderData = useMemo(() => {
    const pasien = { PAGI: [], SIANG: [], SORE: [] };
    const pendamping = { PAGI: [], SIANG: [], SORE: [] };
    const ekstra = { SIANG: [], SORE: [] };

    Object.entries(quantities).forEach(([key, consumers]) => {
      if (!consumers || consumers.length === 0) return;

      const isEkstra = key.startsWith('ekstra_');
      const itemId = isEkstra ? key.replace('ekstra_', '') : key;
      const item = menuMap[itemId];
      if (!item) return;

      const mealTime = item.mealTime?.toUpperCase();
      const normalizedMealTime = mealTime;

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

  const hasPasienItems = Object.values(orderData.pasien).some(arr => arr.length > 0);
  const hasPendampingItems = Object.values(orderData.pendamping).some(arr => arr.length > 0);
  const hasEkstraItems = Object.values(orderData.ekstra).some(arr => arr.length > 0);

  const totalExtraQuantity = useMemo(() => {
    let total = 0;
    ['SIANG', 'SORE'].forEach(key => {
      if (orderData.ekstra[key]) {
        orderData.ekstra[key].forEach(entry => {
          total += entry.qty;
        });
      }
    });
    return total;
  }, [orderData.ekstra]);

  const getMealStyle = (key) => {
    switch (key) {
      case 'PAGI': return { bg: 'bg-primary-50', icon: 'text-neutral-600' };
      case 'SIANG': return { bg: 'bg-warning-50', icon: 'text-warning-700' };
      case 'SORE': return { bg: 'bg-neutral-700', icon: 'text-white' };
      default: return { bg: 'bg-primary-50', icon: 'text-neutral-600' };
    }
  };

  const renderMealSection = (mealTimeKey, items, showIncludedBadge = true) => {
    if (items.length === 0) return null;
    const schedule = MEAL_SCHEDULE[mealTimeKey] || MEAL_SCHEDULE.PAGI;
    const IconComponent = schedule.icon;
    const style = getMealStyle(mealTimeKey);

    return (
      <div key={mealTimeKey} className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
              <IconComponent size={20} className={style.icon} strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-base tracking-tight text-neutral-800">Makan {schedule.label}</p>
              <p className="text-xs text-neutral-400 font-medium">{schedule.time}</p>
            </div>
          </div>
          {showIncludedBadge && (
            <span className="text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full">
              Included
            </span>
          )}
        </div>

        <div className="pl-[52px] space-y-1.5">
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

  const renderEkstraMealSection = (mealTimeKey, items) => {
    if (items.length === 0) return null;
    const schedule = MEAL_SCHEDULE[mealTimeKey] || MEAL_SCHEDULE.SIANG;
    const IconComponent = schedule.icon;
    const style = getMealStyle(mealTimeKey);

    return (
      <div key={`ekstra-${mealTimeKey}`} className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
              <IconComponent size={20} className={style.icon} strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-base tracking-tight text-neutral-800">Makan {schedule.label}</p>
              <p className="text-xs text-neutral-400 font-medium">{schedule.time}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-warning-600 bg-warning-50 px-2.5 py-1 rounded-full">
            Berbayar
          </span>
        </div>

        <div className="pl-[52px] space-y-1.5">
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
      
      const { valid: noteValid, sanitized: sanitizedNote, error: noteError } = validateNote(note);
      if (!noteValid) {
        setErrorModalState({
          isOpen: true,
          title: 'Catatan Tidak Valid',
          message: noteError
        });
        setIsSubmitting(false);
        setShowModal(false);
        return;
      }

      const currentHour = getCurrentWIBHour();
      let invalidLock = null;

      const hasPasienItems = Object.values(orderData.pasien).some(arr => arr.length > 0);
      const hasPendampingItems = Object.values(orderData.pendamping).some(arr => arr.length > 0);
      
      if (hasPasienItems || hasPendampingItems) {
        if (currentHour >= 15) {
          invalidLock = 'Menu Utama (maks 15:00 WIB)';
        }
      }

      if (!invalidLock && orderData.ekstra['SIANG']?.length > 0) {
        if (currentHour >= 10) invalidLock = 'Ekstra Siang (maks 10:00 WIB)';
      }
      if (!invalidLock && orderData.ekstra['SORE']?.length > 0) {
        if (currentHour >= 14) invalidLock = 'Ekstra Sore (maks 14:00 WIB)';
      }

      if (invalidLock) {
        setErrorModalState({
          isOpen: true,
          title: 'Batas Waktu Habis',
          message: `Mohon maaf, batas waktu pemesanan untuk ${invalidLock} telah lewat. Pesanan tidak dapat diproses.`
        });
        setIsSubmitting(false);
        setShowModal(false);
        return;
      }
      
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

      if (hasPasienItems || hasPendampingItems) {
        try {
          const existingOrders = await getOrders({ 
            servingDate: servingDateISO,
            patientId: patient.id,
            type: 'INCLUDE'
          });

          if (existingOrders && existingOrders.length > 0) {
             setErrorModalState({
               isOpen: true,
               title: 'Menu Sudah Dipesan',
               message: 'Menu utama untuk penyajian esok hari sudah dipesan sebelumnya. Anda hanya dapat memesan menu utama 1 kali per hari.'
             });
             setIsSubmitting(false);
             setShowModal(false);
             return;
          }
        } catch (err) {
           console.error("Gagal memeriksa pesanan ganda:", err);
           setErrorModalState({
             isOpen: true,
             title: 'Gagal Memverifikasi',
             message: 'Terjadi kesalahan saat memverifikasi status pesanan Anda. Silakan coba lagi.'
           });
           setIsSubmitting(false);
           setShowModal(false);
           return;
        }
      }

      
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
            notes: sanitizedNote || null
          });
        });
      };

      
      ['PAGI', 'SIANG', 'SORE'].forEach(key => {
        const pasienItems = orderData.pasien[key] || [];
        const pendampingItems = orderData.pendamping[key] || [];

        if (pasienItems.length > 0) addItems('INCLUDE', 'PASIEN', key, pasienItems);
        if (pendampingItems.length > 0) addItems('INCLUDE', 'PENDAMPING', key, pendampingItems);
      });

      
      ['SIANG', 'SORE'].forEach(key => {
        if (orderData.ekstra[key] && orderData.ekstra[key].length > 0) {
          addItems('EXCLUDE', 'PENDAMPING', key, orderData.ekstra[key]);
        }
      });

      await createOrders(orderItemsToInsert);

      
      secureSessionStorage.removeItem('patient_cart_note');

      
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
      console.error(error);
      setErrorModalState({
        isOpen: true,
        title: 'Pesanan Gagal',
        message: `Terjadi kesalahan saat menyimpan pesanan: ${error.message || 'Silakan coba lagi.'}`
      });
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen relative bg-neutral-50 flex flex-col font-sans text-neutral-900 pt-[60px] pb-8">
      
      {}
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary-100/80 rounded-full filter blur-[70px] opacity-80 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-secondary-100/80 rounded-full filter blur-[70px] opacity-80 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-neutral-100">
        <HeaderMobile 
          title={
            <div className="flex flex-col">
              <span>Menu Gizi</span>
              <span className="text-[10px] font-normal text-neutral-400 -mt-0.5">Kesehatan Anda, Prioritas Kami</span>
            </div>
          }
        />
      </div>

      {}
      <div className="w-full max-w-4xl mx-auto px-4 py-4 relative z-10">
        
        {}
        <div className="flex items-center gap-3 mb-1">
          <button 
            onClick={() => navigate('/menu', { state: { restoredQuantities: quantities } })}
            className="flex items-center justify-center bg-transparent border-none outline-none p-0 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={2.5} className="text-neutral-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Konfirmasi Pesanan</h1>
            <p className="text-xs text-neutral-400 -mt-0.5">Periksa kembali menu sebelum dikirim</p>
          </div>
        </div>

        {}
        {hasPasienItems && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-primary-600" />
              <h2 className="text-base font-bold text-primary-700">Pesanan Pasien</h2>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              {['PAGI', 'SIANG', 'SORE'].map(key => 
                renderMealSection(key, orderData.pasien[key])
              )}
            </div>
          </div>
        )}

        {}
        {hasPendampingItems && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-primary-600" />
              <h2 className="text-base font-bold text-primary-700">Pesanan Pendamping</h2>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              {['PAGI', 'SIANG', 'SORE'].map(key => 
                renderMealSection(key, orderData.pendamping[key])
              )}
            </div>
          </div>
        )}

        {}
        {hasEkstraItems && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={18} className="text-warning-600" />
              <h2 className="text-base font-bold text-warning-600">Pesanan Ekstra</h2>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              {['SIANG', 'SORE'].map(key => 
                renderEkstraMealSection(key, orderData.ekstra[key])
              )}
            </div>
          </div>
        )}

        {}
        <div className="mt-5">
          <h2 className="text-base font-bold text-neutral-800 mb-3">Catatan Khusus</h2>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: tanpa pedas, porsi kecil, dll."
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 resize-none transition-all"
            />
            <p className="text-xs text-neutral-400 mt-1.5">
              Catatan ini berlaku untuk seluruh pesanan dalam satu kali checkout.
            </p>
          </div>
        </div>

        {}
        {hasEkstraItems && (
          <div className="mt-5">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 md:p-5">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200 bg-white">
                  <span className="font-bold text-[15px] text-[#1e293b]">Total Extra</span>
                  <span className="font-bold text-[16px] text-[#004e8c]">
                    Rp {(totalExtraQuantity * 15000).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="px-4 py-3 flex gap-3">
                  <div className="text-[#004e8c] flex-shrink-0 mt-[1px]">
                    <Info size={18} strokeWidth={2.2} />
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    Biaya ekstra akan ditambahkan ke Tagihan Kamar / Billing RS saat Anda melakukan Check-out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="mt-8">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none outline-none cursor-pointer"
          >
            <Send size={18} className="rotate-45" />
            Konfirmasi & Kirim Pesanan
          </button>
        </div>

      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-2xl p-6 text-center shadow-xl">
            <div className="mx-auto w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-5">
              <Send size={24} className="text-primary-600 rotate-45 -ml-1 mt-1" />
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 mb-2.5">
              Kirim Pesanan Sekarang?
            </h3>
            
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Pastikan menu yang Anda pilih sudah sesuai. Pesanan yang telah dikirim tidak dapat diubah kembali.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleConfirm()}
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white font-semibold py-3 rounded-full text-sm hover:bg-primary-700 transition-colors outline-none focus:outline-none border-none ring-0 disabled:opacity-70 flex items-center justify-center cursor-pointer"
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
                className="w-full bg-white text-primary-600 font-semibold py-3 rounded-full text-sm border border-solid border-primary-600 hover:bg-neutral-50 transition-colors outline-none focus:outline-none ring-0 disabled:opacity-50 cursor-pointer"
              >
                Periksa Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {errorModalState.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-2xl p-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-danger-500" />
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              {errorModalState.title}
            </h3>
            
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              {errorModalState.message}
            </p>
            
            <button
              onClick={() => setErrorModalState({ isOpen: false, title: '', message: '' })}
              className="w-full bg-danger-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-danger-700 active:scale-[0.98] transition-all outline-none focus:outline-none border-none ring-0 cursor-pointer"
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
    </PageTransition>
  );
}
