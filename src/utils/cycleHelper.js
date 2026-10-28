/**
 * Utilitas Penentuan Siklus Menu Gizi (11 Siklus)
 * Menghitung rotasi siklus menu berdasarkan tanggal penyajian kalender (T+1 esok hari)
 * sesuai ketentuan operasional Dapur Gizi Rumah Sakit.
 */

/**
 * Menghitung nomor siklus menu (1 s.d. 11) berdasarkan tanggal kalender.
 * 
 * Aturan Logika Siklus Menu (PRD 3.2):
 * - Tanggal 1 - 10  : Siklus Menu 1 - 10
 * - Tanggal 11 - 20 : Berulang ke Siklus Menu 1 - 10
 * - Tanggal 21 - 30 : Berulang ke Siklus Menu 1 - 10
 * - Tanggal 31      : Khusus Siklus Menu 11
 * 
 * @param {Date | string} [dateInput] - Tanggal yang dihitung (default: T+1 esok hari)
 * @returns {number} Nomor siklus aktif (1 sampai 11)
 */
function getWIBNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 7);
}

export function getMenuCycleByDate(dateInput) {
  let targetDate;
  if (!dateInput) {
    targetDate = getWIBNow();
    targetDate.setDate(targetDate.getDate() + 1);
  } else {
    targetDate = new Date(dateInput);
  }

  const dayOfMonth = targetDate.getDate();

  // Khusus tanggal 31 selalu siklus 11
  if (dayOfMonth === 31) {
    return 11;
  }

  // Tanggal 1 - 30 berulang pada siklus 1 - 10
  const cycle = dayOfMonth % 10;
  return cycle === 0 ? 10 : cycle;
}

/**
 * Mendapatkan string tanggal penyajian esok hari (T+1) dalam format YYYY-MM-DD (waktu lokal/WIB).
 * 
 * @returns {string} Tanggal esok hari dalam format YYYY-MM-DD
 */
export function getTomorrowServingDate() {
  const tomorrow = getWIBNow();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
}

/**
 * Mendapatkan string tanggal penyajian hari ini (T) dalam format YYYY-MM-DD (waktu lokal/WIB).
 * 
 * @returns {string} Tanggal hari ini format YYYY-MM-DD
 */
export function getTodayServingDate() {
  const today = getWIBNow();
  const pad = (n) => String(n).padStart(2, '0');
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

/**
 * Mendapatkan nomor siklus menu untuk hari ini.
 * 
 * @returns {number} Nomor siklus hari ini (1 - 11)
 */
export function getTodayMenuCycle() {
  return getMenuCycleByDate(getWIBNow());
}

/**
 * Mendapatkan nomor siklus menu untuk esok hari (T+1).
 * 
 * @returns {number} Nomor siklus esok hari (1 - 11)
 */
export function getTomorrowMenuCycle() {
  return getMenuCycleByDate();
}
