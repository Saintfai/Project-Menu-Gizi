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
export function getMenuCycleByDate(dateInput) {
  let targetDate;
  if (!dateInput) {
    targetDate = new Date();
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
 * Mendapatkan string tanggal penyajian esok hari (T+1) dalam format YYYY-MM-DD.
 * 
 * @returns {string} Tanggal esok hari dalam format ISO date string (YYYY-MM-DD)
 */
export function getTomorrowServingDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
