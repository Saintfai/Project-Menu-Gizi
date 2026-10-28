/**
 * Service Layanan Siklus Menu & Komponen Makanan
 * Berinteraksi dengan endpoint API RS Edelweiss untuk pengambilan, pembaruan,
 * dan sinkronisasi siklus menu gizi harian (Siklus 1 - 11).
 */

import { apiGet, apiPostFormData, apiPut } from './apiClient';
import { getMenuCycleByDate } from '../utils/cycleHelper';

/**
 * Normalisasi objek menu dari API RS Edelweiss ke format internal aplikasi.
 * Mendukung kompatibilitas properti camelCase dan snake_case.
 * 
 * @param {object} item - Objek data menu mentah dari API RS
 * @returns {object|null} Objek menu ternormalisasi atau null jika data kosong
 */
function normalizeMenuItem(item) {
  if (!item) return null;
  return {
    id: item.mid,
    mid: item.mid,
    name: item.name || '',
    cycleId: item.cycle_id,
    cycle_id: item.cycle_id,
    mealTime: (item.meal_time || '').toUpperCase(),
    meal_time: item.meal_time,
    paketName: item.paket_name || 'Paket A',
    paket_name: item.paket_name,
    description: item.description || '',
    karbohidrat: item.karbohidrat || '-',
    protein: item.protein || '-',
    nabati: item.nabati || '-',
    proteinTambahan: item.protein_tambahan || '-',
    protein_tambahan: item.protein_tambahan || '-',
    sayur: item.sayur || '-',
    bentukMakanan: item.bentuk_makanan || '-',
    bentuk_makanan: item.bentuk_makanan || '-',
    isBiasa: item.is_biasa === true || item.is_biasa === 'true',
    isCair: item.is_cair === true || item.is_cair === 'true',
    isLunak: item.is_lunak === true || item.is_lunak === 'true',
    is_biasa: item.is_biasa === true || item.is_biasa === 'true',
    is_cair: item.is_cair === true || item.is_cair === 'true',
    is_lunak: item.is_lunak === true || item.is_lunak === 'true',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

const MEAL_ORDER = {
  PAGI: 1,
  SIANG: 2,
  SORE: 3,
};

/**
 * Mengurutkan daftar menu secara konsisten berdasarkan:
 * 1. Nomor Siklus (1 - 11)
 * 2. Waktu Makan (PAGI -> SIANG -> SORE)
 * 3. Nama Paket secara berurutan (Paket A -> Paket B -> Paket C -> dst.)
 * 4. ID Menu (sebagai tie-breaker)
 *
 * Hal ini mencegah urutan kartu berpindah (misal Paket C mendahului Paket B)
 * ketika baris di database PostgreSQL baru saja di-edit oleh admin.
 *
 * @param {Array<object>} items - Daftar menu ternormalisasi
 * @returns {Array<object>} Daftar menu yang telah terurut rapi
 */
function sortMenuItems(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const cycleDiff = (Number(a.cycleId) || 0) - (Number(b.cycleId) || 0);
    if (cycleDiff !== 0) return cycleDiff;

    const mealDiff = (MEAL_ORDER[a.mealTime] || 99) - (MEAL_ORDER[b.mealTime] || 99);
    if (mealDiff !== 0) return mealDiff;

    const paketA = String(a.paketName || '').trim();
    const paketB = String(b.paketName || '').trim();
    const paketCompare = paketA.localeCompare(paketB, 'id', { numeric: true, sensitivity: 'base' });
    if (paketCompare !== 0) return paketCompare;

    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
}

/**
 * Mengambil menu siklus yang sedang aktif untuk jadwal penyajian besok (T+1) langsung dari
 * endpoint cepat RS Edelweiss (/webhook/menu-gizi-cycle).
 * Mengembalikan 11 hidangan khusus siklus aktif tanpa mengunduh seluruh 117 menu.
 * 
 * @returns {Promise<Array<object>>} Daftar hidangan menu pada siklus aktif
 */
export async function getActiveCycleMenuFast() {
  try {
    const data = await apiGet('/webhook/menu-gizi-cycle');
    if (Array.isArray(data) && data.length > 0) {
      return sortMenuItems(data.map(normalizeMenuItem).filter(Boolean));
    }
  } catch (err) {
    console.warn('[menuService] Gagal mengambil menu-gizi-cycle, fallback ke getAllMenuItems:', err.message);
  }
  // Fallback ke siklus berdasarkan tanggal jika endpoint khusus gagal
  const targetCycle = getMenuCycleByDate();
  return getMenuItemsByCycle(targetCycle);
}

/**
 * Mengambil menu siklus yang sedang aktif untuk jadwal penyajian besok (T+1) dari API RS Edelweiss.
 * Memastikan siklus menu yang dilihat pasien dan admin selalu SAMA PERSIS.
 * 
 * @param {number|string} [cycleId] - Nomor siklus (opsional, jika kosong default mengikuti jadwal T+1 esok hari)
 * @returns {Promise<Array<object>>} Daftar hidangan menu pada siklus aktif
 */
export async function getActiveCycleMenu(cycleId) {
  if (!cycleId) {
    return getActiveCycleMenuFast();
  }
  const targetCycle = cycleId || getMenuCycleByDate();
  return getMenuItemsByCycle(targetCycle);
}

/**
 * Mengambil hidangan menu untuk siklus hari ini (T).
 * 
 * @returns {Promise<Array<object>>} Daftar hidangan menu siklus hari ini
 */
export async function getTodayCycleMenu() {
  const todayCycle = getMenuCycleByDate(new Date());
  return getMenuItemsByCycle(todayCycle);
}

/**
 * Mengambil hidangan menu untuk siklus esok hari (T+1).
 * 
 * @returns {Promise<Array<object>>} Daftar hidangan menu siklus esok hari
 */
export async function getTomorrowCycleMenu() {
  const tomorrowCycle = getMenuCycleByDate();
  return getMenuItemsByCycle(tomorrowCycle);
}

let menuItemsCache = null;
let menuItemsCacheTime = 0;
let menuItemsInFlight = null;
const CACHE_TTL_MS = 60000; // 60 detik

/**
 * Membersihkan cache menu in-memory lokal.
 * Dipanggil otomatis saat admin menambah atau mengubah hidangan menu.
 * 
 * @returns {void}
 */
export function clearMenuCache() {
  menuItemsCache = null;
  menuItemsCacheTime = 0;
  menuItemsInFlight = null;
}

/**
 * Mengambil seluruh hidangan menu (seluruh 11 siklus) dari API RS Edelweiss.
 * Dilengkapi cache in-memory (TTL 60 detik) dan deduplikasi request paralel
 * untuk mencegah pemanggilan berulang yang lambat.
 * 
 * @param {boolean} [forceRefresh=false] - Jika true, abaikan cache dan ambil ulang dari server
 * @returns {Promise<Array<object>>} Daftar seluruh hidangan menu
 */
export async function getAllMenuItems(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && menuItemsCache && (now - menuItemsCacheTime < CACHE_TTL_MS)) {
    return menuItemsCache;
  }

  if (!forceRefresh && menuItemsInFlight) {
    return menuItemsInFlight;
  }

  menuItemsInFlight = (async () => {
    try {
      const data = await apiGet('/webhook/menu-gizi');
      if (!Array.isArray(data)) {
        return menuItemsCache || [];
      }
      const normalized = sortMenuItems(data.map(normalizeMenuItem).filter(Boolean));
      menuItemsCache = normalized;
      menuItemsCacheTime = Date.now();
      return normalized;
    } finally {
      menuItemsInFlight = null;
    }
  })();

  return menuItemsInFlight;
}

/**
 * Mengambil daftar hidangan menu berdasarkan nomor siklus tertentu (1 s.d 11).
 * 
 * @param {number|string} cycleId - Nomor siklus menu (1 - 11)
 * @param {boolean} [forceRefresh=false] - Jika true, paksa fetch ulang data dari server
 * @returns {Promise<Array<object>>} Daftar menu pada siklus tersebut
 */
export async function getMenuItemsByCycle(cycleId, forceRefresh = false) {
  const allItems = await getAllMenuItems(forceRefresh);
  const numId = Number(cycleId);
  return allItems.filter(item => Number(item.cycleId) === numId);
}

/**
 * Mengambil daftar 11 siklus menu tetap di rumah sakit.
 * 
 * @returns {Promise<Array<{ id: number, name: string }>>} Daftar 11 siklus menu
 */
export async function getMenuCycles() {
  return Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Siklus ${i + 1}`,
  }));
}

/**
 * Mengubah rincian hidangan menu gizi via API RS Edelweiss (PUT /webhook/edit-menu-gizi).
 * 
 * @param {number|string} id - Menu ID (mid)
 * @param {object} [updates={}] - Data perubahan komponen makanan
 * @param {string} [updates.name] - Nama menu hidangan
 * @param {number|string} [updates.cycleId] - Nomor siklus (1 - 11)
 * @param {'PAGI'|'SIANG'|'SORE'} [updates.mealTime] - Waktu makan
 * @param {string} [updates.paketName] - Nama paket (Paket A / Paket B)
 * @param {string} [updates.description] - Deskripsi menu
 * @param {string} [updates.karbohidrat] - Komponen karbohidrat
 * @param {string} [updates.protein] - Komponen protein utama
 * @param {string} [updates.nabati] - Komponen protein nabati
 * @param {string} [updates.proteinTambahan] - Komponen protein tambahan
 * @param {string} [updates.sayur] - Komponen sayuran
 * @param {string} [updates.bentukMakanan] - Bentuk makanan (Biasa / Lunak / Cair)
 * @returns {Promise<any>} Hasil respons pembaruan dari server
 */
export async function updateMenuItem(id, updates = {}) {
  const params = {
    mid: id,
    name: updates.name || '',
    cycle_id: updates.cycleId || updates.cycle_id || 1,
    meal_time: (updates.mealTime || updates.meal_time || 'PAGI').toUpperCase(),
    paket_name: updates.paketName || updates.paket_name || 'Paket A',
    description: updates.description || '',
    karbohidrat: updates.karbohidrat || '-',
    protein: updates.protein || '-',
    nabati: updates.nabati || '-',
    protein_tambahan: updates.proteinTambahan || updates.protein_tambahan || '-',
    sayur: updates.sayur || '-',
    bentuk_makanan: updates.bentukMakanan || updates.bentuk_makanan || '-',
    is_biasa: String(Boolean(updates.isBiasa ?? updates.is_biasa)),
    is_cair: String(Boolean(updates.isCair ?? updates.is_cair)),
    is_lunak: String(Boolean(updates.isLunak ?? updates.is_lunak)),
  };

  const res = await apiPut('/webhook/edit-menu-gizi', params);
  clearMenuCache();
  return res;
}

/**
 * Menambahkan hidangan menu baru ke dalam siklus via API RS Edelweiss (POST /webhook/add-menu-gizi).
 * Menggunakan format multipart/form-data.
 * 
 * @param {object} [item={}] - Data hidangan baru yang akan ditambahkan
 * @param {string} item.name - Nama hidangan
 * @param {number|string} item.cycleId - Nomor siklus menu (1 - 11)
 * @param {'PAGI'|'SIANG'|'SORE'} item.mealTime - Waktu penyajian makanan
 * @param {string} item.paketName - Nama paket (contoh: 'Paket A')
 * @param {string} [item.description] - Deskripsi makanan
 * @param {string} [item.karbohidrat] - Komponen karbohidrat
 * @param {string} [item.protein] - Komponen protein utama
 * @param {string} [item.nabati] - Komponen nabati
 * @param {string} [item.proteinTambahan] - Komponen protein tambahan
 * @param {string} [item.sayur] - Komponen sayur
 * @param {string} [item.bentukMakanan] - Bentuk makanan (Biasa / Lunak / Cair)
 * @param {boolean} [item.isBiasa] - Cocok untuk diet makanan biasa
 * @param {boolean} [item.isCair] - Cocok untuk diet makanan cair
 * @param {boolean} [item.isLunak] - Cocok untuk diet makanan lunak
 * @returns {Promise<any>} Hasil respons penambahan dari server
 */
export async function createMenuItem(item = {}) {
  const formData = new FormData();

  formData.append('name', String(item.name || '').trim());
  formData.append('cycle_id', String(item.cycleId ?? item.cycle_id ?? 1));
  formData.append('meal_time', String(item.mealTime || item.meal_time || 'PAGI').toUpperCase());
  formData.append('paket_name', String(item.paketName || item.paket_name || 'Paket A').trim());
  formData.append('description', String(item.description || '').trim());
  formData.append('karbohidrat', item.karbohidrat && item.karbohidrat.trim() !== '' ? item.karbohidrat.trim() : '-');
  formData.append('protein', item.protein && item.protein.trim() !== '' ? item.protein.trim() : '-');
  formData.append('nabati', item.nabati && item.nabati.trim() !== '' ? item.nabati.trim() : '-');
  formData.append(
    'protein_tambahan',
    item.proteinTambahan && item.proteinTambahan.trim() !== ''
      ? item.proteinTambahan.trim()
      : (item.protein_tambahan && item.protein_tambahan.trim() !== '' ? item.protein_tambahan.trim() : '-')
  );
  formData.append('sayur', item.sayur && item.sayur.trim() !== '' ? item.sayur.trim() : '-');
  formData.append('bentuk_makanan', String(item.bentukMakanan || item.bentuk_makanan || '-'));
  formData.append('is_biasa', String(Boolean(item.isBiasa ?? item.is_biasa)));
  formData.append('is_cair', String(Boolean(item.isCair ?? item.is_cair)));
  formData.append('is_lunak', String(Boolean(item.isLunak ?? item.is_lunak)));

  const res = await apiPostFormData('/webhook/add-menu-gizi', formData);
  clearMenuCache();
  return res;
}

/**
 * Menghapus hidangan menu.
 * Catatan: Struktur 11 siklus menu bersifat tetap di rumah sakit, disarankan mengedit konten yang ada.
 * 
 * @throws {Error} Selalu melempar error karena penghapusan tidak didukung oleh sistem RS
 */
export async function deleteMenuItem() {
  throw new Error('Penghapusan item menu tidak didukung oleh sistem RS. Silakan ubah konten menu yang ada.');
}

export default {
  getActiveCycleMenu,
  getActiveCycleMenuFast,
  getTodayCycleMenu,
  getTomorrowCycleMenu,
  getAllMenuItems,
  getMenuItemsByCycle,
  getMenuCycles,
  updateMenuItem,
  createMenuItem,
  deleteMenuItem,
  clearMenuCache,
};
