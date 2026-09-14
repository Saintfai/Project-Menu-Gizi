/**
 * NAMA FILE: formatters.js
 * FUNGSI UTAMA: Fungsi-fungsi utilitas pendukung (Helper Functions).
 * 
 * DETAIL:
 * - Berisi fungsi murni (pure functions) untuk pemformatan, validasi, atau komputasi umum.
 * - Dapat dipanggil dari berbagai bagian aplikasi untuk menghindari duplikasi kode.
 */

export function formatRupiah(amount) {
  if (typeof amount !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}


export function formatIndonesianDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
