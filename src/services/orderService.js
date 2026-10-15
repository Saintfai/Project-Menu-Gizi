import { apiGet, apiPostFormData, apiPut } from './apiClient';
import { enrichOrdersWithPatientAllergies } from './patientService';

/**
 * Standarisasi satu baris data pesanan dari API RS Edelweiss ke format internal aplikasi.
 * Menangani mapping kolom snake_case dan camelCase serta status tipe pesanan.
 * 
 * @param {object} raw - Data mentah pesanan dari API RS
 * @returns {object|null} Objek pesanan ternormalisasi atau null jika data kosong
 */
function normalizeOrder(raw) {
  if (!raw) return null;
  const rawMeal = (raw.meal_time || '').toUpperCase();
  const mealTime = rawMeal === 'MALAM' ? 'SORE' : rawMeal;
  // Sesuai kesepakatan: data lama yang type-nya null dianggap 'INCLUDE'
  const orderType = raw.type ? raw.type.toUpperCase() : 'INCLUDE';

  return {
    id: raw.id,
    orderCode: raw.order_id || `ORD-${raw.patient_id}`,
    orderId: raw.order_id,
    order_id: raw.order_id,
    patientId: raw.patient_id,
    patient_id: raw.patient_id,
    noReg: raw.noreg || raw.no_reg || raw.no_regis || raw.no_registrasi || null,
    noreg: raw.noreg || raw.no_reg || raw.no_regis || raw.no_registrasi || null,
    no_reg: raw.noreg || raw.no_reg || raw.no_regis || raw.no_registrasi || null,
    no_regis: raw.noreg || raw.no_reg || raw.no_regis || raw.no_registrasi || null,
    patientName: raw.consumer_name || 'Pasien',
    consumer_name: raw.consumer_name,
    consumer: raw.consumer || 'pasien',
    rmNumber: String(raw.patient_id),
    roomNumber: raw.room_number || '-',
    room_number: raw.room_number,
    classType: raw.class_type || '-',
    class_type: raw.class_type,
    mealTime,
    meal_time: raw.meal_time,
    menuName: raw.menu_name || '',
    menu_name: raw.menu_name,
    paketName: raw.paket_name || 'Paket A',
    paket_name: raw.paket_name,
    bentukMakanan: raw.bentuk_makanan || '-',
    bentuk_makanan: raw.bentuk_makanan,
    quantity: Number(raw.quantity) || 1,
    servingDate: raw.serving_date,
    serving_date: raw.serving_date,
    createdAt: raw.created_at,
    created_at: raw.created_at,
    notes: raw.notes || null,
    type: orderType,
    hasExplicitType: Boolean(raw.type),
    description: raw.description || '-',
    karbohidrat: raw.karbohidrat || '-',
    protein: raw.protein || '-',
    nabati: raw.nabati || '-',
    proteinTambahan: raw.protein_tambahan || '-',
    protein_tambahan: raw.protein_tambahan || '-',
    sayur: raw.sayur || '-',
  };
}

const OVERRIDES_STORAGE_KEY = 'hospital_order_overrides';
const LOCAL_ORDERS_STORAGE_KEY = 'hospital_local_orders';

/**
 * Mengambil data override lokal (catatan khusus & kondimen yang diubah admin) dari localStorage.
 * 
 * @returns {Record<string, object>} Objek peta orderId ke data override
 */
export function getStoredOverrides() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(OVERRIDES_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Menyimpan data override lokal (catatan khusus & kondimen) ke localStorage.
 * 
 * @param {Record<string, object>} overrides - Objek peta orderId ke data override
 * @returns {void}
 */
export function saveStoredOverrides(overrides) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch (e) {
    console.warn('Failed to save order overrides to localStorage:', e);
  }
}

let inMemoryLocalOrders = [];

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

/**
 * Mengambil daftar pesanan yang tersimpan di penyimpanan lokal (local orders fallback).
 * Digunakan agar pesanan yang baru di-checkout langsung muncul tanpa menunggu jeda server.
 * 
 * @returns {Array<object>} Daftar pesanan lokal
 */
export function getStoredLocalOrders() {
  try {
    const storage = getStorage();
    if (storage) {
      const raw = storage.getItem(LOCAL_ORDERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    return inMemoryLocalOrders;
  } catch {
    return inMemoryLocalOrders;
  }
}

/**
 * Menyimpan daftar pesanan lokal ke penyimpanan browser (localStorage dan in-memory).
 * 
 * @param {Array<object>} orders - Daftar pesanan yang akan disimpan
 * @returns {void}
 */
export function saveStoredLocalOrders(orders) {
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
    inMemoryLocalOrders = Array.isArray(orders) ? orders : [];
  } catch (e) {
    console.warn('Failed to save local orders to localStorage:', e);
    inMemoryLocalOrders = Array.isArray(orders) ? orders : [];
  }
}

/**
 * Menghapus seluruh data pesanan lokal yang tersimpan di storage browser.
 * 
 * @returns {void}
 */
export function clearStoredLocalOrders() {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(LOCAL_ORDERS_STORAGE_KEY);
    }
    inMemoryLocalOrders = [];
  } catch (e) {
    console.warn('Failed to clear local orders from localStorage:', e);
    inMemoryLocalOrders = [];
  }
}

/**
 * Memeriksa apakah kelas kamar termasuk kategori VIP A ke atas (VIP A, VVIP, Suite).
 * 
 * @param {string} classType - Nama kelas kamar pasien
 * @returns {boolean} True jika kelas termasuk VIP A ke atas
 */
function isVipAKelas(classType) {
  const c = (classType || '').toUpperCase();
  return c.includes('VIP A') || c.includes('VVIP') || c.includes('SUITE');
}

/**
 * Inferensi otomatis untuk data riwayat lama di mana kolom `type` masih null:
 * 1. Jika data sudah memiliki type resmi dari API (data baru), fungsi ini tidak mengubah apapun (hasExplicitType = true).
 * 2. Untuk data lama yang type-nya null:
 *    - Pada kelas non-VIP A (VIP B, VIP C, Kelas 1, 2, 3), kuota Paket Utama Siang & Sore hanya untuk pasien (tidak ada jatah pendamping).
 *      Maka pesanan pendamping di Siang/Sore pada kelas ini otomatis adalah Paket Ekstra (EXCLUDE).
 *    - Pada kelas VIP A ke atas, baris pendamping kedua dan seterusnya pada waktu makan yang sama adalah Paket Ekstra (EXCLUDE).
 * 
 * @param {Array<object>} orders - Daftar pesanan
 * @returns {Array<object>} Daftar pesanan dengan field type yang sudah disesuaikan
 */
function inferMissingTypes(orders) {
  const seenPendamping = new Set();
  const sorted = [...orders].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  sorted.forEach(item => {
    if (item.hasExplicitType) return;
    if (item.mealTime !== 'SIANG' && item.mealTime !== 'SORE') return;
    if ((item.consumer || '').toLowerCase() !== 'pendamping') return;

    const key = `${item.orderCode}_${item.mealTime}`;
    const isVipA = isVipAKelas(item.classType);

    if (!isVipA) {
      item.type = 'EXCLUDE';
    } else {
      if (seenPendamping.has(key)) {
        item.type = 'EXCLUDE';
      } else {
        seenPendamping.add(key);
      }
    }
  });
  return orders;
}

/**
 * Mengambil daftar pesanan dari Sistem RS Edelweiss (/webhook/all-order-item).
 * Menggabungkan data server dengan pesanan lokal (local orders) agar pesanan baru
 * langsung tampil secara real-time di Dashboard Dapur dan Menu Portal.
 * 
 * @param {object} [options={}] - Filter opsional untuk menyaring pesanan
 * @param {string} [options.servingDate] - Filter tanggal penyajian (format YYYY-MM-DD atau ISO string)
 * @param {string|number} [options.patientId] - Filter No. RM / ID Pasien
 * @param {'INCLUDE' | 'EXCLUDE'} [options.type] - Filter tipe pesanan (INCLUDE = Paket Utama, EXCLUDE = Paket Ekstra)
 * @param {string} [options.orderCode] - Filter kode unik transaksi pesanan
 * @param {string} [options.noreg] - Filter nomor registrasi pasien
 * @param {boolean} [options.withPatientAllergies] - Jika true, lakukan enrichment riwayat alergi pasien
 * @returns {Promise<Array<object>>} Daftar pesanan yang telah difilter dan dinormalisasi
 */
export async function getOrders(options = {}) {
  let data = [];
  try {
    const res = await apiGet('/webhook/all-order-item');
    if (Array.isArray(res)) {
      data = res;
    }
  } catch (err) {
    console.warn('[orderService] Gagal fetch all-order-item dari server, menggunakan local orders fallback:', err.message);
  }

  const overrides = getStoredOverrides();
  const localOrders = getStoredLocalOrders();

  let orders = data.map(raw => {
    const item = normalizeOrder(raw);
    if (!item) return null;

    // Terapkan override lokal jika admin pernah mengubah catatan/kondimen pesanan ini
    const ov = overrides[String(item.id)];
    if (ov) {
      if (ov.notes !== undefined) item.notes = ov.notes;
      if (ov.karbohidrat !== undefined) item.karbohidrat = ov.karbohidrat;
      if (ov.protein !== undefined) item.protein = ov.protein;
      if (ov.sayur !== undefined) item.sayur = ov.sayur;
      if (ov.nabati !== undefined) item.nabati = ov.nabati;
      if (ov.proteinTambahan !== undefined) {
        item.proteinTambahan = ov.proteinTambahan;
        item.protein_tambahan = ov.proteinTambahan;
      }
    }
    return item;
  }).filter(Boolean);

  // Gabungkan pesanan lokal yang belum tercatat di server (deduplikasi)
  if (localOrders.length > 0) {
    const serverOrderCodes = new Set(orders.map(o => o.orderCode).filter(Boolean));
    const serverMealKeys = new Set(
      orders.map(o => `${o.patientId}_${String(o.servingDate || '').slice(0, 10)}_${(o.mealTime || '').toUpperCase()}_${(o.consumer || '').toLowerCase()}`)
    );

    localOrders.forEach(localItem => {
      const hasCode = localItem.orderCode && serverOrderCodes.has(localItem.orderCode);
      const hasMeal = serverMealKeys.has(
        `${localItem.patientId}_${String(localItem.servingDate || '').slice(0, 10)}_${(localItem.mealTime || '').toUpperCase()}_${(localItem.consumer || '').toLowerCase()}`
      );

      if (!hasCode && !hasMeal) {
        // Terapkan override jika ada
        const ov = overrides[String(localItem.id)];
        if (ov) {
          if (ov.notes !== undefined) localItem.notes = ov.notes;
          if (ov.karbohidrat !== undefined) localItem.karbohidrat = ov.karbohidrat;
          if (ov.protein !== undefined) localItem.protein = ov.protein;
          if (ov.sayur !== undefined) localItem.sayur = ov.sayur;
          if (ov.nabati !== undefined) localItem.nabati = ov.nabati;
          if (ov.proteinTambahan !== undefined) {
            localItem.proteinTambahan = ov.proteinTambahan;
            localItem.protein_tambahan = ov.proteinTambahan;
          }
        }
        orders.push(localItem);
      }
    });
  }

  orders = inferMissingTypes(orders);

  // Filter berdasarkan tanggal penyajian
  if (options.servingDate) {
    const targetDateStr = String(options.servingDate).slice(0, 10);
    orders = orders.filter(item => {
      const rawDate = item.servingDate || item.createdAt;
      if (!rawDate) return false;

      const rawStr = String(rawDate);
      if (rawStr.slice(0, 10) === targetDateStr) return true;

      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        const localDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        return localDateStr === targetDateStr;
      }

      return false;
    });
  }

  // Filter berdasarkan ID pasien (No. RM)
  if (options.patientId !== undefined && options.patientId !== null) {
    const normalizePid = (val) => {
      if (val === undefined || val === null) return '';
      const s = String(val).trim().replace(/^RM-?/i, '');
      const num = parseInt(s, 10);
      return !isNaN(num) ? String(num) : s.toLowerCase();
    };

    const targetPid = normalizePid(options.patientId);
    orders = orders.filter(item => normalizePid(item.patientId) === targetPid);
  }

  // Filter type jika diminta
  if (options.type) {
    const targetType = options.type.toUpperCase();
    orders = orders.filter(item => item.type === targetType);
  }

  // Filter orderCode jika diminta
  if (options.orderCode) {
    orders = orders.filter(item => item.orderCode === options.orderCode);
  }

  // Filter noreg / noReg jika diminta
  if (options.noreg || options.noReg) {
    const targetReg = String(options.noreg || options.noReg).trim().toLowerCase();
    orders = orders.filter(item => String(item.noReg || item.noreg || '').trim().toLowerCase() === targetReg);
  }

  // Lengkapi data pesanan dengan riwayat alergi pasien
  if (options.withPatientAllergies) {
    orders = await enrichOrdersWithPatientAllergies(orders);
  }

  return orders;
}

/**
 * Mengirimkan satu item pesanan ke API RS Edelweiss via POST Multipart/form-data.
 * Mendukung percobaan ulang (retry) otomatis jika terjadi kendala koneksi sementara.
 * 
 * @param {object} item - Objek satu item pesanan yang akan dikirim
 * @param {number} [maxRetries=3] - Maksimal jumlah percobaan pengiriman ulang
 * @returns {Promise<any>} Hasil respons pengiriman dari server
 */
async function postSingleOrderItem(item, maxRetries = 3) {
  const formData = new FormData();

  const rawMeal = String(item.mealTime || 'pagi').toLowerCase();
  const mealTime = rawMeal === 'malam' ? 'sore' : rawMeal;

  const regNumber = item.noreg || item.noReg || item.no_reg || item.no_regis || '';

  formData.append('patient_id', String(item.patientId));
  formData.append('noreg', String(regNumber));
  formData.append('no_reg', String(regNumber));
  formData.append('no_regis', String(regNumber));
  formData.append('room_number', String(item.roomNumber || '-'));
  formData.append('class_type', String(item.classType || '-'));
  formData.append('titipan', String(item.titipan || ''));
  formData.append('notes', String(item.notes || ''));
  formData.append('consumer', String(item.consumer || 'pasien').toLowerCase());
  formData.append('consumer_name', String(item.consumerName || item.patientName || 'Pasien'));
  formData.append('meal_time', mealTime);
  formData.append('menu_name', String(item.menuName || '-'));
  formData.append('paket_name', String(item.paketName || 'paket a').toLowerCase());
  formData.append('bentuk_makanan', String(item.bentukMakanan || '-'));
  formData.append('description', String(item.description || '-'));
  formData.append('karbohidrat', String(item.karbohidrat || '-'));
  formData.append('protein', String(item.protein || '-'));
  formData.append('nabati', String(item.nabati || '-'));
  formData.append('protein_tambahan', String(item.proteinTambahan || item.protein_tambahan || '-'));
  formData.append('sayur', String(item.sayur || '-'));
  formData.append('quantity', String(item.quantity || 1));
  formData.append('serving_date', String(item.servingDate || ''));
  formData.append('order_id', String(item.orderId || ''));
  formData.append('type', String(item.type || 'include').toLowerCase());

  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiPostFormData('/webhook/order-item', formData);
      return response;
    } catch (err) {
      lastError = err;
      console.warn(`[orderService] Percobaan ${attempt}/${maxRetries} gagal untuk item:`, item.menuName, err.message);
      if (attempt < maxRetries) {
        // Jeda waktu eksponensial sebelum retry
        await new Promise(res => setTimeout(res, attempt * 800));
      }
    }
  }

  throw lastError;
}

/**
 * Mengirimkan sejumlah item pesanan dari keranjang belanja pasien ke API RS Edelweiss.
 * Setiap item dikirim sebagai satu permintaan POST independen dengan order_id yang sama.
 * Sukses atau gagal otomatis dicatat ke fallback local storage.
 * 
 * @param {Array<object>} orderItems - Kumpulan item pesanan yang akan di-checkout
 * @param {function} [onProgress] - Callback pemantauan progres checkout ({ current, total, item })
 * @returns {Promise<{ success: boolean, total: number, succeeded: Array<object> }>} Ringkasan status checkout
 */
export async function createOrders(orderItems, onProgress) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new Error('Daftar pesanan kosong.');
  }

  const succeeded = [];
  const failed = [];

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    if (onProgress) {
      onProgress({ current: i + 1, total: orderItems.length, item });
    }

    try {
      await postSingleOrderItem(item, 3);
      succeeded.push(item);
    } catch (err) {
      console.error(`[orderService] Gagal mengirim item ke-${i + 1}:`, err);
      failed.push({ item, error: err.message });
      // Berhenti dan simpan status agar user dapat mencoba kembali item yang gagal
      break;
    }
  }

  // Simpan pesanan sukses ke storage lokal agar langsung tampil di UI
  if (succeeded.length > 0) {
    const existingLocal = getStoredLocalOrders();
    const newLocalEntries = succeeded.map((item, idx) => {
      const regNumber = item.noreg || item.noReg || item.no_reg || item.no_regis || null;
      const rawMeal = String(item.mealTime || 'PAGI').toUpperCase();
      const mealTime = rawMeal === 'MALAM' ? 'SORE' : rawMeal;
      const orderType = item.type ? String(item.type).toUpperCase() : 'INCLUDE';

      return {
        id: `local-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`,
        orderCode: item.orderId || `ORD-${item.patientId}`,
        orderId: item.orderId,
        order_id: item.orderId,
        patientId: item.patientId,
        patient_id: item.patientId,
        noReg: regNumber,
        noreg: regNumber,
        no_reg: regNumber,
        no_regis: regNumber,
        patientName: item.consumerName || item.patientName || 'Pasien',
        consumer_name: item.consumerName || item.patientName || 'Pasien',
        consumer: String(item.consumer || 'pasien').toLowerCase(),
        rmNumber: String(item.patientId),
        roomNumber: item.roomNumber || '-',
        room_number: item.roomNumber,
        classType: item.classType || '-',
        class_type: item.classType,
        titipan: item.titipan || '',
        mealTime,
        meal_time: item.mealTime,
        menuName: item.menuName || '-',
        menu_name: item.menuName,
        paketName: item.paketName || 'Paket A',
        paket_name: item.paketName,
        bentukMakanan: item.bentukMakanan || '-',
        bentuk_makanan: item.bentukMakanan,
        quantity: Number(item.quantity) || 1,
        servingDate: item.servingDate,
        serving_date: item.servingDate,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        notes: item.notes || null,
        type: orderType,
        hasExplicitType: true,
        description: item.description || '-',
        karbohidrat: item.karbohidrat || '-',
        protein: item.protein || '-',
        nabati: item.nabati || '-',
        proteinTambahan: item.proteinTambahan || item.protein_tambahan || '-',
        protein_tambahan: item.proteinTambahan || item.protein_tambahan || '-',
        sayur: item.sayur || '-',
      };
    });

    saveStoredLocalOrders([...existingLocal, ...newLocalEntries]);
  }

  if (failed.length > 0) {
    const error = new Error(`Gagal mengirim sebagian pesanan (${succeeded.length}/${orderItems.length} berhasil).`);
    error.succeededItems = succeeded;
    error.failedItems = orderItems.slice(succeeded.length);
    throw error;
  }

  return {
    success: true,
    total: orderItems.length,
    succeeded,
  };
}

/**
 * Memperbarui catatan khusus dan komponen gizi pesanan pada sistem RS Edelweiss & local storage.
 * 
 * @param {string|number} id - Order ID (ID baris pesanan)
 * @param {string} notes - Catatan khusus baru
 * @param {object} [updatedFields={}] - Pembaruan field komponen gizi
 * @param {string} [updatedFields.karbohidrat] - Komponen karbohidrat
 * @param {string} [updatedFields.protein] - Komponen protein utama
 * @param {string} [updatedFields.sayur] - Komponen sayuran
 * @param {string} [updatedFields.nabati] - Komponen protein nabati
 * @param {string} [updatedFields.proteinTambahan] - Komponen protein tambahan
 * @returns {Promise<{ success: boolean }>} Status keberhasilan pembaruan
 */
export async function updateOrderNotes(id, notes, updatedFields = {}) {
  // 1. Simpan ke local persistent cache agar instan dan tidak hilang saat re-fetch
  const overrides = getStoredOverrides();
  overrides[String(id)] = {
    notes,
    ...updatedFields,
    updatedAt: new Date().toISOString(),
  };
  saveStoredOverrides(overrides);

  // 2. Kirim update ke API webhook Edelweiss RS
  try {
    await apiPut('/webhook/ubah-order-item', {
      id,
      notes,
      karbohidrat: updatedFields.karbohidrat || '',
      protein: updatedFields.protein || '',
      sayur: updatedFields.sayur || '',
      nabati: updatedFields.nabati || '',
      protein_tambahan: updatedFields.proteinTambahan || updatedFields.protein_tambahan || '',
    });
  } catch (err) {
    console.warn('[orderService] Webhook ubah-order-item finished with note:', err?.message || err);
  }

  return { success: true };
}

/**
 * Fungsi fallback auto-generate pesanan untuk kelas reguler (diabaikan pada integrasi RS langsung).
 * 
 * @returns {Promise<{ success: boolean, generatedOrdersCount: number, message: string }>}
 */
export async function autoGenerateOrdersForKelas() {
  return { success: false, generatedOrdersCount: 0, message: 'Diabaikan di sistem eksisting' };
}

export default {
  getOrders,
  createOrders,
  updateOrderNotes,
  autoGenerateOrdersForKelas,
  enrichOrdersWithPatientAllergies,
};
