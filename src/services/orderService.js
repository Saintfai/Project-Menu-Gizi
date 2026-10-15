import { apiGet, apiPostFormData, apiPut } from './apiClient';
import { enrichOrdersWithPatientAllergies } from './patientService';

/**
 * Normalisasi satu baris data pesanan dari API Edelweiss ke format internal.
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

export function getStoredOverrides() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(OVERRIDES_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredOverrides(overrides) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch (e) {
    console.warn('Failed to save order overrides to localStorage:', e);
  }
}

function isVipAKelas(classType) {
  const c = (classType || '').toUpperCase();
  return c.includes('VIP A') || c.includes('VVIP') || c.includes('SUITE');
}

/**
 * Fallback untuk data riwayat lama di mana kolom `type` masih null:
 * 1. Jika data sudah memiliki type resmi dari API (data baru), fungsi ini tidak mengubah apapun (hasExplicitType = true).
 * 2. Untuk data lama yang type-nya null:
 *    - Pada kelas non-VIP A (VIP B, VIP C, Kelas 1, 2, 3), kuota Paket Utama Siang & Sore hanya untuk pasien (tidak ada jatah pendamping).
 *      Maka pesanan pendamping di Siang/Sore pada kelas ini otomatis adalah Paket Ekstra (EXCLUDE).
 *    - Pada kelas VIP A ke atas, baris pendamping kedua dan seterusnya pada waktu makan yang sama adalah Paket Ekstra (EXCLUDE).
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
 * Mengambil daftar pesanan dari Sistem Eksisting RS Edelweiss (/webhook/all-order-item).
 * Data bersumber murni dari server — tidak ada penggabungan dengan data lokal (localStorage).
 * 
 * @param {object} [options={}] - Filter opsional
 * @param {string} [options.servingDate] - Filter tanggal penyajian (ISO string atau YYYY-MM-DD)
 * @param {string|number} [options.patientId] - Filter ID Pasien (No. RM)
 * @param {'INCLUDE' | 'EXCLUDE'} [options.type] - Filter tipe pesanan
 * @param {string} [options.orderCode] - Filter kode transaksi pesanan
 * @returns {Promise<Array<object>>}
 */
export async function getOrders(options = {}) {
  const res = await apiGet('/webhook/all-order-item');
  let data = Array.isArray(res) ? res : [];

  const overrides = getStoredOverrides();

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

  orders = inferMissingTypes(orders);

  // Filter servingDate jika diminta (dengan parsing tanggal lokal & UTC yang tahan banting)
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

  // Filter patientId jika diminta (menormalisasi prefix RM-, spasi, dan leading zeroes)
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

  // Jika diminta memperkaya data dengan riwayat alergi pasien (2nd GET ke /webhook/get-patient)
  if (options.withPatientAllergies) {
    orders = await enrichOrdersWithPatientAllergies(orders);
  }

  return orders;
}

/**
 * Mendapatkan tanggal penyajian esok hari (T+1) dalam zona waktu WIB (UTC+7)
 * dengan format YYYY-MM-DD.
 * 
 * @returns {string} Tanggal esok hari format YYYY-MM-DD
 */
export function getTomorrowServingDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);
  wibTime.setDate(wibTime.getDate() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  return `${wibTime.getFullYear()}-${pad(wibTime.getMonth() + 1)}-${pad(wibTime.getDate())}`;
}

/**
 * Memeriksa langsung ke database server apakah pasien telah memiliki pesanan Paket Utama
 * untuk tanggal penyajian tertentu (default: esok hari T+1).
 * 
 * Validasi ini 100% mengacu pada data riil yang ada di database server (/webhook/all-order-item).
 * 
 * @param {string|number} patientId - ID Pasien / No. RM
 * @param {string} [servingDate] - Format YYYY-MM-DD (default: esok hari WIB)
 * @param {string} [noReg] - No. Registrasi pasien (opsional, untuk verifikasi ganda)
 * @returns {Promise<boolean>} true jika pesanan Paket Utama sudah ada di database server
 */
export async function checkPatientHasOrderedMain(patientId, servingDate, noReg = null) {
  if (!patientId && !noReg) return false;

  const targetDate = servingDate || getTomorrowServingDate();

  // Ambil data langsung dari server tanpa cache browser
  const orders = await getOrders({ 
    servingDate: targetDate, 
    type: 'INCLUDE' 
  });

  const normalizePid = (val) => {
    if (val === undefined || val === null) return '';
    const s = String(val).trim().replace(/^RM-?/i, '');
    const num = parseInt(s, 10);
    return !isNaN(num) ? String(num) : s.toLowerCase();
  };

  const targetPid = normalizePid(patientId);
  const targetReg = noReg ? String(noReg).trim().toLowerCase() : null;

  return orders.some(o => {
    const matchPid = targetPid && normalizePid(o.patientId) === targetPid;
    const itemReg = String(o.noReg || o.noreg || '').trim().toLowerCase();
    const matchReg = targetReg && itemReg && itemReg === targetReg;
    return matchPid || matchReg;
  });
}

/**
 * Mengirimkan satu item pesanan ke API Edelweiss via POST Multipart/form-data.
 * Mendukung percobaan ulang (retry) otomatis jika terjadi kegagalan jaringan sementara.
 * 
 * @param {object} item - Item pesanan
 * @param {number} [maxRetries=3] - Maksimal percobaan ulang
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
 * Memverifikasi apakah pesanan benar-benar tersimpan di database server
 * dengan melakukan polling ke /webhook/all-order-item setelah POST berhasil.
 * 
 * @param {string} orderId - Order ID yang dicari
 * @param {string|number} patientId - ID pasien
 * @param {number} [maxAttempts=3] - Maksimal percobaan verifikasi
 * @param {number} [delayMs=2000] - Jeda antar percobaan (ms)
 * @returns {Promise<boolean>} true jika ditemukan di server
 */
async function verifyOrderPersisted(orderId, patientId, maxAttempts = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(res => setTimeout(res, delayMs));
    try {
      const allOrders = await apiGet('/webhook/all-order-item');
      if (Array.isArray(allOrders)) {
        const found = allOrders.some(o =>
          (o.order_id === orderId || o.orderId === orderId) &&
          String(o.patient_id) === String(patientId)
        );
        if (found) return true;
      }
    } catch (err) {
      console.warn(`[orderService] Verifikasi percobaan ${attempt}/${maxAttempts}:`, err.message);
    }
  }
  return false;
}

/**
 * Mengirimkan sejumlah item pesanan ke API Edelweiss.
 * Setiap item dikirim sebagai 1 permintaan POST independen dengan order_id yang sama.
 * Setelah semua item berhasil dikirim, melakukan verifikasi bahwa data benar-benar
 * tersimpan di database server (bukan hanya diterima webhook).
 * 
 * @param {Array<object>} orderItems - Daftar item pesanan yang akan di-submit
 * @param {function} [onProgress] - Callback untuk melaporkan kemajuan (progress: { current, total, item, phase })
 * @returns {Promise<{ success: boolean, total: number, succeeded: Array<object> }>}
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
      onProgress({ current: i + 1, total: orderItems.length, item, phase: 'sending' });
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

  if (failed.length > 0) {
    const error = new Error(`Gagal mengirim sebagian pesanan (${succeeded.length}/${orderItems.length} berhasil).`);
    error.succeededItems = succeeded;
    error.failedItems = orderItems.slice(succeeded.length);
    throw error;
  }

  // Verifikasi bahwa pesanan benar-benar tersimpan di database server.
  // n8n webhook bisa saja merespons 200 OK tapi gagal menulis ke database (silent failure).
  if (succeeded.length > 0 && onProgress) {
    onProgress({ current: succeeded.length, total: orderItems.length, phase: 'verifying' });
  }

  const firstItem = succeeded[0];
  const orderId = firstItem?.orderId;
  const patientId = firstItem?.patientId;

  if (orderId && patientId) {
    const persisted = await verifyOrderPersisted(orderId, patientId, 3, 2000);
    if (!persisted) {
      const error = new Error(
        'Pesanan telah dikirim ke server, tetapi belum terverifikasi masuk ke database. ' +
        'Silakan tunggu beberapa saat lalu periksa kembali, atau hubungi petugas gizi.'
      );
      error.succeededItems = succeeded;
      error.verificationFailed = true;
      throw error;
    }
  }

  return {
    success: true,
    total: orderItems.length,
    succeeded,
  };
}

/**
 * Memperbarui catatan dan komponen gizi pesanan pada sistem RS Edelweiss & local storage.
 * 
 * @param {string|number} id - Order ID
 * @param {string} notes - Catatan baru
 * @param {object} [updatedFields={}] - Field komponen gizi { karbohidrat, protein, sayur, nabati, proteinTambahan }
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
 * Fallback auto generate (jika tetap dipanggil di background).
 */
export async function autoGenerateOrdersForKelas() {
  return { success: false, generatedOrdersCount: 0, message: 'Diabaikan di sistem eksisting' };
}

/**
 * Membersihkan data local orders lama dari localStorage (jika ada dari versi sebelumnya).
 * Dipanggil sekali saat aplikasi dimuat untuk memastikan tidak ada ghost data.
 */
export function cleanupLegacyLocalOrders() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('hospital_local_orders');
    }
  } catch {
    // Ignore cleanup errors
  }
}

export default {
  getOrders,
  createOrders,
  checkPatientHasOrderedMain,
  getTomorrowServingDate,
  updateOrderNotes,
  autoGenerateOrdersForKelas,
  enrichOrdersWithPatientAllergies,
  cleanupLegacyLocalOrders,
};

