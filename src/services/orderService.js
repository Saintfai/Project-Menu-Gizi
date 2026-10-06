import { apiGet, apiPostFormData, apiPut } from './apiClient';

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

function getStoredOverrides() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(OVERRIDES_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredOverrides(overrides) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch (e) {
    console.warn('Failed to save order overrides to localStorage:', e);
  }
}

/**
 * Mengambil daftar pesanan dari Sistem Eksisting RS Edelweiss (/webhook/all-order-item).
 * 
 * @param {object} [options={}] - Filter opsional
 * @param {string} [options.servingDate] - Filter tanggal penyajian (ISO string atau YYYY-MM-DD)
 * @param {string|number} [options.patientId] - Filter ID Pasien (No. RM)
 * @param {'INCLUDE' | 'EXCLUDE'} [options.type] - Filter tipe pesanan
 * @param {string} [options.orderCode] - Filter kode transaksi pesanan
 * @returns {Promise<Array<object>>}
 */
export async function getOrders(options = {}) {
  const data = await apiGet('/webhook/all-order-item');
  if (!Array.isArray(data)) {
    return [];
  }

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

  // Filter servingDate jika diminta
  if (options.servingDate) {
    const targetDateStr = String(options.servingDate).slice(0, 10);
    orders = orders.filter(item => {
      if (!item.servingDate) return false;
      const itemDateStr = String(item.servingDate).slice(0, 10);
      return itemDateStr === targetDateStr;
    });
  }

  // Filter patientId jika diminta
  if (options.patientId !== undefined && options.patientId !== null) {
    const targetPid = String(options.patientId);
    orders = orders.filter(item => String(item.patientId) === targetPid);
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

  return orders;
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

  formData.append('patient_id', String(item.patientId));
  formData.append('room_number', String(item.roomNumber || '-'));
  formData.append('class_type', String(item.classType || '-'));
  formData.append('titipan', String(item.titipan || ''));
  formData.append('notes', String(item.notes || ''));
  formData.append('consumer', String(item.consumer || 'pasien').toLowerCase());
  formData.append('consumer_name', String(item.consumerName || item.patientName || 'Pasien'));
  formData.append('meal_time', String(item.mealTime || 'pagi').toLowerCase());
  formData.append('menu_name', String(item.menuName || '-'));
  formData.append('paket_name', String(item.paketName || 'paket a').toLowerCase());
  formData.append('bentuk_makanan', String(item.bentukMakanan || '-'));
  formData.append('description', String(item.description || '-'));
  formData.append('karbohidrat', String(item.karbohidrat || '-'));
  formData.append('protein', String(item.protein || '-'));
  formData.append('nabati', String(item.nabati || '-'));
  formData.append('protein_tambahan', String(item.proteinTambahan || '-'));
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
 * Mengirimkan sejumlah item pesanan ke API Edelweiss.
 * Setiap item dikirim sebagai 1 permintaan POST independen dengan order_id yang sama.
 * 
 * @param {Array<object>} orderItems - Daftar item pesanan yang akan di-submit
 * @param {function} [onProgress] - Callback untuk melaporkan kemajuan (progress: { current, total, item })
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

export default {
  getOrders,
  createOrders,
  updateOrderNotes,
  autoGenerateOrdersForKelas,
};

