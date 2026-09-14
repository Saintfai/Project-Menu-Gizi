/**
 * NAMA FILE: cycleHelper.js
 * FUNGSI UTAMA: Fungsi-fungsi utilitas pendukung (Helper Functions).
 * 
 * DETAIL:
 * - Berisi fungsi murni (pure functions) untuk pemformatan, validasi, atau komputasi umum.
 * - Dapat dipanggil dari berbagai bagian aplikasi untuk menghindari duplikasi kode.
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

  
  if (dayOfMonth === 31) {
    return 11;
  }

  
  const cycle = dayOfMonth % 10;
  return cycle === 0 ? 10 : cycle;
}


export function getTomorrowServingDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
