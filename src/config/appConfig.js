/**
 * Konfigurasi Cut-Off & Mode Demo
 */
const appConfig = {
  // Set true agar bebas pesan kapan saja saat demo
  DEMO_MODE: false,

  // Batas jam pemesanan (format jam WIB: 0-23)
  CUTOFF_MAIN: 15,          // Paket Utama (15:00 WIB)
  CUTOFF_EXTRA_SIANG: 10,   // Ekstra Siang (10:00 WIB)
  CUTOFF_EXTRA_SORE: 14,    // Ekstra Sore (14:00 WIB)
};

// Label otomatis untuk tampilan UI
appConfig.CUTOFF_MAIN_TEXT = `${String(appConfig.CUTOFF_MAIN).padStart(2, '0')}:00 WIB`;
appConfig.CUTOFF_EXTRA_SIANG_TEXT = `${String(appConfig.CUTOFF_EXTRA_SIANG).padStart(2, '0')}:00 WIB`;
appConfig.CUTOFF_EXTRA_SORE_TEXT = `${String(appConfig.CUTOFF_EXTRA_SORE).padStart(2, '0')}:00 WIB`;

export default appConfig;
