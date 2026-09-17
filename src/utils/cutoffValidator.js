/**
 * Memeriksa status batas waktu (Cut-Off Time) pemesanan Paket Utama.
 * Berdasarkan PRD 3.2, pemesanan Paket Utama esok hari (T+1) ditutup tepat pukul 15:00 WIB.
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

  const isPastCutoff = hours >= 15;

  return {
    isPastCutoff,
    cutoffTimeText: '15:00 WIB',
    currentTimeWIB: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`,
  };
}

/**
 * Mendapatkan jam saat ini dalam zona waktu WIB (UTC+7) dalam format integer 0 - 23.
 * Digunakan untuk validasi cut-off bertingkat (Utama: 15:00, Ekstra Siang: 10:00, Ekstra Sore: 14:00).
 * 
 * @returns {number} Jam saat ini dalam WIB (0 s.d. 23)
 */
export function getCurrentWIBHour() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);
  return wibTime.getHours();
}
