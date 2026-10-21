import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, User, Users, Sun, Cloud, Moon, ShoppingBag, Loader2, Info, AlertCircle } from 'lucide-react';
import HeaderMobile from '../../components/ui/layout/HeaderMobile';
import { usePatient } from '../../context/PatientContext';
import { createOrders, getOrders, checkPatientHasOrderedMain, getTomorrowServingDate } from '../../services/orderService';
import { getPatientByRm } from '../../services/patientService';
import { getActiveCycleMenu } from '../../services/menuService';
import PageTransition from '../../components/PageTransition';
import { validateNote } from '../../utils/inputValidator';
import { secureSessionStorage } from '../../utils/secureStorage';
import { getCurrentWIBHour } from '../../utils/cutoffValidator';
import appConfig from '../../config/appConfig';

// Jadwal jam penyajian per waktu makan
const MEAL_SCHEDULE = {
  PAGI: { label: 'Pagi', time: '06:30 - 08:30 WIB', icon: Sun },
  SIANG: { label: 'Siang', time: '11:30 - 13:30 WIB', icon: Cloud },
  SORE: { label: 'Sore', time: '17:30 - 19:30 WIB', icon: Moon },
};

// Halaman ringkasan dan konfirmasi checkout pesanan pasien
export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, updatePatientInfo } = usePatient();
  const [note, setNote] = useState(() => {
    return secureSessionStorage.getItem('patient_cart_note') || '';
  });

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [pendingRetryItems, setPendingRetryItems] = useState(null); // Item yang gagal terkirim (untuk retry)
  const [errorModalState, setErrorModalState] = useState({ isOpen: false, title: '', message: '' });

  const [serverHasOrderedMain, setServerHasOrderedMain] = useState(false);

  // Proteksi: alihkan ke login jika data pasien kosong & verifikasi status order di server
  React.useEffect(() => {
    if (!patient || !patient.id) {
      navigate('/login', { replace: true });
      return;
    }

    let isMounted = true;
    async function verifyDatabaseStatus() {
      try {
        const tomorrowStr = getTomorrowServingDate();
        const ordered = await checkPatientHasOrderedMain(
          patient.id || patient.rmNumber,
          tomorrowStr,
          patient.noReg || patient.noreg
        );
        if (isMounted) {
          setServerHasOrderedMain(ordered);
        }
      } catch (err) {
        console.warn('Gagal memverifikasi status order di server:', err);
      }
    }

    verifyDatabaseStatus();
    return () => { isMounted = false; };
  }, [patient, navigate]);

  // Simpan catatan ke session storage agar tidak hilang saat reload
  React.useEffect(() => {
    secureSessionStorage.setItem('patient_cart_note', note);
  }, [note]);

  // Ambil pilihan menu dari state navigasi atau pulihkan dari session storage terenkripsi
  const [quantities] = useState(() => {
    const locQuantities = location.state?.quantities;
    if (locQuantities && Object.keys(locQuantities).length > 0) {
      secureSessionStorage.setItem('patient_cart_quantities', locQuantities);
      return locQuantities;
    }
    return secureSessionStorage.getItem('patient_cart_quantities', true) || {};
  });

  const [menuItems, setMenuItems] = useState(location.state?.menuItems || []);

  // Muat ulang menu siklus aktif jika menuItems belum terisi (misal saat halaman di-refresh)
  React.useEffect(() => {
    if (menuItems.length === 0) {
      getActiveCycleMenu().then(data => {
        if (data && data.length > 0) {
          setMenuItems(data);
        }
      }).catch(err => {
        console.warn('Gagal memuat ulang menuItems di Cart:', err);
      });
    }
  }, [menuItems.length]);

  // Map menuItems berdasarkan ID untuk pencarian cepat (kompatibel ID string & number)
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach(item => { map[String(item.id)] = item; });
    return map;
  }, [menuItems]);

  // Kelompokkan item terpilih ke kategori: pasien, pendamping, dan ekstra
  const orderData = useMemo(() => {
    const pasien = { PAGI: [], SIANG: [], SORE: [] };
    const pendamping = { PAGI: [], SIANG: [], SORE: [] };
    const ekstra = { SIANG: [], SORE: [] };

    Object.entries(quantities).forEach(([key, consumers]) => {
      if (!consumers || consumers.length === 0) return;

      const isEkstra = key.startsWith('ekstra_');
      const itemId = isEkstra ? key.replace('ekstra_', '') : key;
      const item = menuMap[String(itemId)];
      if (!item) return;

      const mealTime = item.mealTime?.toUpperCase();
      const normalizedMealTime = mealTime;

      if (isEkstra) {
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

  // Total porsi paket ekstra berbayar untuk kalkulasi tagihan
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

  // Warna & ikon sesuai waktu makan
  const getMealStyle = (key) => {
    switch (key) {
      case 'PAGI': return { bg: 'bg-primary-50', icon: 'text-neutral-600' };
      case 'SIANG': return { bg: 'bg-warning-50', icon: 'text-warning-700' };
      case 'SORE': return { bg: 'bg-neutral-700', icon: 'text-white' };
      default: return { bg: 'bg-primary-50', icon: 'text-neutral-600' };
    }
  };

  // Render rincian paket menu utama (Include)
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

  // Render rincian paket menu ekstra (Berbayar)
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

  // Kirim pesanan ke database (validasi input, cut-off time, & cek order ganda)
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {

      // 1. Validasi catatan khusus
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

      // 2. Cek cut-off time real-time
      const currentHour = getCurrentWIBHour();
      let invalidLock = null;

      const hasPasienItems = Object.values(orderData.pasien).some(arr => arr.length > 0);
      const hasPendampingItems = Object.values(orderData.pendamping).some(arr => arr.length > 0);

      if (hasPasienItems || hasPendampingItems) {
        if (appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_MAIN) {
          invalidLock = `Menu Utama (maks ${appConfig.CUTOFF_MAIN_TEXT})`;
        }
      }

      if (!invalidLock && orderData.ekstra['SIANG']?.length > 0) {
        if (appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_EXTRA_SIANG) invalidLock = `Ekstra Siang (maks ${appConfig.CUTOFF_EXTRA_SIANG_TEXT})`;
      }
      if (!invalidLock && orderData.ekstra['SORE']?.length > 0) {
        if (appConfig.DEMO_MODE ? false : currentHour >= appConfig.CUTOFF_EXTRA_SORE) invalidLock = `Ekstra Sore (maks ${appConfig.CUTOFF_EXTRA_SORE_TEXT})`;
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

      // 3. Lengkapi nomor registrasi (noReg) pasien jika belum ada dari sesi sebelumnya
      let effectivePatient = { ...patient };
      const hasReg = effectivePatient.noReg || effectivePatient.noreg || effectivePatient.no_reg || effectivePatient.no_regis;
      const pid = effectivePatient.rmNumber || effectivePatient.id;
      if (!hasReg && pid) {
        try {
          const fresh = await getPatientByRm(pid);
          if (fresh?.patient) {
            effectivePatient = { ...effectivePatient, ...fresh.patient };
            if (updatePatientInfo) updatePatientInfo(fresh.patient);
          }
        } catch (e) {
          console.warn('Could not re-hydrate patient noReg in Cart:', e.message);
        }
      }

      // 4. Buat kode pesanan unik & format tanggal saji T+1
      const orderItemsToInsert = [];
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `ORD-${dateStr}-${effectivePatient.rmNumber || effectivePatient.id}-${randomStr}`;

      const tomorrowServingDateStr = getTomorrowServingDate();
      const [year, month, date] = tomorrowServingDateStr.split('-');
      const servingDateFormatted = `${year}-${month}-${date} 12:00:00`;

      // 5. Validasi Batas Kuota Porsi Berdasarkan Kelas Kamar Pasien
      if (hasPasienItems || hasPendampingItems) {
        const roomClassLower = (effectivePatient.effectiveClass || effectivePatient.roomClass || '').toLowerCase();
        const isVipA = roomClassLower.includes('vip a') || roomClassLower.includes('vip_a') || roomClassLower.includes('suite');
        const maxPortions = {
          PAGI: 2,
          SIANG: isVipA ? 2 : 1,
          SORE: isVipA ? 2 : 1,
        };

        for (const meal of ['PAGI', 'SIANG', 'SORE']) {
          const pCount = (orderData.pasien[meal] || []).reduce((sum, item) => sum + (item.qty || 0), 0);
          const pendCount = (orderData.pendamping[meal] || []).reduce((sum, item) => sum + (item.qty || 0), 0);
          const totalMain = pCount + pendCount;
          if (totalMain > maxPortions[meal]) {
            setErrorModalState({
              isOpen: true,
              title: 'Batas Porsi Terlampaui',
              message: `Jumlah porsi Menu Utama Makan ${meal} (${totalMain} porsi) melebihi batas kuota kelas ${effectivePatient.effectiveClass || effectivePatient.roomClass || 'kamar'} (maksimal ${maxPortions[meal]} porsi).`
            });
            setIsSubmitting(false);
            setShowModal(false);
            return;
          }
        }
      }

      // 6. Pastikan menu utama belum pernah dipesan hari ini untuk besok (cek pesanan ganda di server)
      if (hasPasienItems || hasPendampingItems) {
        try {
          const hasAlreadyOrdered = await checkPatientHasOrderedMain(
            effectivePatient.id || effectivePatient.rmNumber,
            tomorrowServingDateStr,
            effectivePatient.noReg || effectivePatient.noreg
          );

          if (hasAlreadyOrdered) {
            setErrorModalState({
              isOpen: true,
              title: 'Menu Sudah Dipesan',
              message: 'Menu utama untuk penyajian esok hari sudah terdaftar di database server. Anda hanya dapat memesan menu utama 1 kali per hari.'
            });
            setIsSubmitting(false);
            setShowModal(false);
            return;
          }
        } catch (err) {
          console.error("Gagal memeriksa pesanan ganda di server:", err);
          setErrorModalState({
            isOpen: true,
            title: 'Gagal Memverifikasi',
            message: 'Terjadi kesalahan saat memverifikasi status pesanan Anda ke database server. Silakan coba lagi.'
          });
          setIsSubmitting(false);
          setShowModal(false);
          return;
        }
      }

      // 7. Susun data pesanan ke format tabel orders
      const addItems = (type, consumer, mealTimeKey, itemsArr) => {
        itemsArr.forEach(entry => {
          const patientReg = effectivePatient.noReg || effectivePatient.noreg || effectivePatient.no_regis || effectivePatient.no_reg || '';
          orderItemsToInsert.push({
            orderId: orderCode,
            patientId: effectivePatient.id,
            noReg: patientReg,
            noreg: patientReg,
            no_reg: patientReg,
            no_regis: patientReg,
            roomNumber: effectivePatient.roomName || '-',
            classType: effectivePatient.originalClass || effectivePatient.roomClass || '-',
            titipan: effectivePatient.titipan || '',
            menuName: entry.item.name || '-',
            paketName: entry.paketName || 'Paket A',
            mealTime: mealTimeKey,
            servingDate: servingDateFormatted,
            quantity: entry.qty,
            type: type,
            consumer: consumer,
            consumerName: effectivePatient.name || 'Pasien',
            notes: sanitizedNote || '',
            bentukMakanan: effectivePatient.bentukMakanan || entry.item.bentukMakanan || '-',
            description: entry.item.description || '-',
            karbohidrat: entry.item.karbohidrat || '-',
            protein: entry.item.protein || '-',
            nabati: entry.item.nabati || '-',
            proteinTambahan: entry.item.proteinTambahan || entry.item.protein_tambahan || '-',
            sayur: entry.item.sayur || '-',
          });
        });
      };

      // Alokasikan menu utama (Include)
      ['PAGI', 'SIANG', 'SORE'].forEach(key => {
        const pasienItems = orderData.pasien[key] || [];
        const pendampingItems = orderData.pendamping[key] || [];

        if (pasienItems.length > 0) addItems('INCLUDE', 'PASIEN', key, pasienItems);
        if (pendampingItems.length > 0) addItems('INCLUDE', 'PENDAMPING', key, pendampingItems);
      });

      // Alokasikan menu ekstra (Berbayar / Exclude)
      ['SIANG', 'SORE'].forEach(key => {
        if (orderData.ekstra[key] && orderData.ekstra[key].length > 0) {
          addItems('EXCLUDE', 'PENDAMPING', key, orderData.ekstra[key]);
        }
      });

      // Gunakan pendingRetryItems jika sebelumnya ada transaksi parsial yang gagal
      const itemsToSubmit = pendingRetryItems || orderItemsToInsert;

      // 8. Kirim pesanan ke database server
      await createOrders(itemsToSubmit, ({ current, total, phase }) => {
        if (phase === 'verifying') {
          setSubmitProgress('Memverifikasi pesanan di server...');
        } else {
          setSubmitProgress(`Mengirim item ${current} dari ${total}...`);
        }
      });

      // 9. Bersihkan data sementara dan buka halaman sukses
      secureSessionStorage.removeItem('patient_cart_note');
      secureSessionStorage.removeItem('patient_cart');
      secureSessionStorage.removeItem('patient_cart_quantities');
      setPendingRetryItems(null);

      // Hitung ringkasan porsi untuk halaman sukses
      const summaryMap = {};
      itemsToSubmit.forEach(entry => {
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
      // 10. Tangani error / retry jika gagal parsial atau verifikasi server gagal
      if (error.verificationFailed) {
        // Server menerima POST (200 OK) tapi data tidak muncul di database
        setErrorModalState({
          isOpen: true,
          title: 'Pesanan Belum Terverifikasi',
          message: error.message
        });
      } else if (error.failedItems && error.failedItems.length > 0) {
        setPendingRetryItems(error.failedItems);
        setErrorModalState({
          isOpen: true,
          title: 'Sebagian Pesanan Gagal Terkirim',
          message: `${error.message} Silakan klik tombol 'Coba Lagi' untuk mengirimkan sisa item pesanan tanpa mengulang dari awal.`
        });
      } else {
        setErrorModalState({
          isOpen: true,
          title: 'Pesanan Gagal',
          message: `Terjadi kesalahan saat menyimpan pesanan: ${error.message || 'Silakan coba lagi.'}`
        });
      }
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
      setSubmitProgress('');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative bg-transparent flex flex-col font-sans text-neutral-900 pt-[60px] pb-8">

        {/* 1. Header atas aplikasi mobile */}
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

        <div className="w-full max-w-4xl mx-auto px-4 py-4 relative z-10">

          {/* 2. Tombol kembali ke menu katalog & judul halaman */}
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

          {serverHasOrderedMain && (hasPasienItems || hasPendampingItems) && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Menu Utama Sudah Dipesan di Database:</span> Anda telah melakukan pemesanan Paket Utama untuk jadwal esok hari. Sesuai aturan sesi tunggal, menu utama tidak dapat dipesan kembali.
              </div>
            </div>
          )}

          {/* 3. Kartu rincian menu utama untuk Pasien */}
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

          {/* 4. Kartu rincian menu utama untuk Pendamping */}
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

          {/* 5. Kartu rincian menu ekstra (berbayar) */}
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

          {/* 6. Form input catatan khusus untuk seluruh pesanan */}
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

          {/* 7. Total estimasi biaya menu ekstra (masuk ke billing RS) */}
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

          {/* 8. Tombol konfirmasi untuk membuka modal */}
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

        {/* 9. Modal popup konfirmasi kirim pesanan */}
        {showModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <div 
              className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
              onClick={() => !isSubmitting && setShowModal(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 bg-white w-full max-w-[320px] rounded-2xl p-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
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
                      {submitProgress || 'Memproses...'}
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
          </div>,
          document.body
        )}

        {/* 10. Modal popup error / batas waktu / coba lagi item gagal */}
        {errorModalState.isOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <div 
              className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
              onClick={() => setErrorModalState({ isOpen: false, title: '', message: '' })}
              aria-hidden="true"
            />
            <div className="relative z-10 bg-white w-full max-w-[320px] rounded-2xl p-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-danger-500" />
              </div>

              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                {errorModalState.title}
              </h3>

              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                {errorModalState.message}
              </p>

              <div className="flex flex-col gap-2">
                {pendingRetryItems && pendingRetryItems.length > 0 ? (
                  <>
                    <button
                      onClick={() => {
                        setErrorModalState({ isOpen: false, title: '', message: '' });
                        handleConfirm();
                      }}
                      className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary-700 active:scale-[0.98] transition-all outline-none focus:outline-none border-none ring-0 cursor-pointer"
                    >
                      Coba Lagi ({pendingRetryItems.length} Item Tersisa)
                    </button>
                    <button
                      onClick={() => setErrorModalState({ isOpen: false, title: '', message: '' })}
                      className="w-full bg-neutral-100 text-neutral-600 font-semibold py-2.5 rounded-xl text-xs hover:bg-neutral-200 transition-all outline-none focus:outline-none border-none ring-0 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setErrorModalState({ isOpen: false, title: '', message: '' })}
                    className="w-full bg-danger-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-danger-700 active:scale-[0.98] transition-all outline-none focus:outline-none border-none ring-0 cursor-pointer"
                  >
                    Oke, Mengerti
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </PageTransition>
  );
}
