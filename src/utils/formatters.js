/**
 * Formats a number to Indonesian Rupiah currency format.
 * @param {number} amount
 * @returns {string} e.g. "Rp 25.000"
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

/**
 * Formats a Date object or date string into Indonesian formatted date.
 * @param {Date|string} date
 * @returns {string} e.g. "Selasa, 2 September 2026"
 */
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
