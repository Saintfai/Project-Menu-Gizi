/**
 * Utilitas Validasi Batas Waktu Pemesanan (Cut-Off Time)
 */
import appConfig from '../config/appConfig';

/**
 * Memeriksa status batas waktu pemesanan Paket Utama.
 * Mengonversi waktu lokal perangkat ke Waktu Indonesia Barat (WIB / UTC+7).
 * 
 * @returns {{ isPastCutoff: boolean, cutoffTimeText: string, currentTimeWIB: string }}
 */
export function checkMainMealCutoff() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);

  const hours = wibTime.getHours();
  const minutes = wibTime.getMinutes();

  const isPastCutoff = appConfig.DEMO_MODE ? false : hours >= appConfig.CUTOFF_MAIN;

  return {
    isPastCutoff,
    cutoffTimeText: appConfig.CUTOFF_MAIN_TEXT,
    currentTimeWIB: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`,
  };
}

/**
 * Mendapatkan jam saat ini dalam zona waktu WIB (UTC+7) dalam format integer 0 - 23.
 * 
 * @returns {number} Jam saat ini dalam WIB (0 s.d. 23)
 */
export function getCurrentWIBHour() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);
  return wibTime.getHours();
}
