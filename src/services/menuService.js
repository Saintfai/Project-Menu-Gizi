import { apiGet, apiPut } from './apiClient';
import { getMenuCycleByDate } from '../utils/cycleHelper';

/**
 * Normalisasi objek menu dari API Edelweiss agar kompatibel
 * dengan properti camelCase lama dan snake_case baru.
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
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

/**
 * Mengambil menu siklus yang sedang aktif untuk jadwal penyajian besok (T+1) dari API Edelweiss.
 * Memastikan siklus menu yang dilihat pasien dan admin selalu SAMA PERSIS.
 * 
 * @param {number|string} [cycleId] - Nomor siklus (opsional, default: T+1 esok hari)
 * @returns {Promise<Array<object>>}
 */
export async function getActiveCycleMenu(cycleId) {
  const targetCycle = cycleId || getMenuCycleByDate();
  return getMenuItemsByCycle(targetCycle);
}

/**
 * Mengambil seluruh menu (116 menu / seluruh 11 siklus) dari API Edelweiss.
 * 
 * @returns {Promise<Array<object>>}
 */
export async function getAllMenuItems() {
  const data = await apiGet('/webhook/menu-gizi');
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(normalizeMenuItem);
}

/**
 * Mengambil menu berdasarkan ID Siklus (1 - 11).
 * 
 * @param {number|string} cycleId 
 * @returns {Promise<Array<object>>}
 */
export async function getMenuItemsByCycle(cycleId) {
  const allItems = await getAllMenuItems();
  const numId = Number(cycleId);
  return allItems.filter(item => Number(item.cycleId) === numId);
}

/**
 * Mengambil daftar siklus menu (1 s.d 11).
 * 
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function getMenuCycles() {
  return Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Siklus ${i + 1}`,
  }));
}

/**
 * Mengubah data item menu gizi via API Edelweiss (PUT /webhook/edit-menu-gizi).
 * 
 * @param {number|string} id - Menu ID (mid)
 * @param {object} updates - Nilai yang diubah
 * @returns {Promise<any>}
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
  };

  return apiPut('/webhook/edit-menu-gizi', params);
}

/**
 * Menambahkan item menu baru.
 * Catatan: Struktur 11 siklus bersifat tetap (fixed) di sistem RS.
 */
export async function createMenuItem() {
  throw new Error('Penambahan item menu baru tidak didukung oleh sistem RS. Silakan ubah konten menu yang ada.');
}

/**
 * Menghapus item menu.
 * Catatan: Struktur 11 siklus bersifat tetap (fixed) di sistem RS.
 */
export async function deleteMenuItem() {
  throw new Error('Penghapusan item menu tidak didukung oleh sistem RS. Silakan ubah konten menu yang ada.');
}
