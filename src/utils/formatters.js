/**
 * NAMA FILE: formatters.js
 * FUNGSI UTAMA: Utilitas pemformatan data teks, tanggal, telepon, dan alamat.
 * 
 * DETAIL:
 * - Menyediakan helper konsisten untuk masking data privasi pasien (alamat & nomor telepon).
 * - Memformat tanggal ke format D/M/Y.
 * - Menstandardisasi tampilan kelas kamar.
 */

/**
 * Format string tanggal (YYYY-MM-DD atau ISO) ke format DD/MM/YYYY.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return dateString;
  const d = dateObj.getDate().toString().padStart(2, '0');
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * Masking alamat pasien untuk menjaga privasi namun tetap dapat dikenali oleh keluarga/pasien.
 */
export const maskAddress = (address) => {
  if (!address || address.trim() === '' || address === '-') return '-';
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const first = parts[0]
      .replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d/-]+/gi, '')
      .replace(/\b\d+[\w\d/-]*/g, '')
      .trim();
    const last = parts[parts.length - 1];
    return `${first || parts[0]}, ****, ${last}`;
  } else if (parts.length === 2) {
    let first = parts[0];
    if (/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d/-]+/i.test(first) || /\d+/.test(first)) {
      first = first.replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d/-]+/gi, '****');
      first = first.replace(/\b\d+[\w\d/-]*/g, '****');
    } else {
      const words = first.split(' ');
      if (words.length > 2) {
        first = `${words.slice(0, 2).join(' ')} ****`;
      } else {
        first = `${first} ****`;
      }
    }
    return `${first}, ${parts[1]}`;
  } else {
    let masked = address
      .replace(/\b(no\.?|blok|kav\.?|rt|rw|unit|lt\.?)\s*[\w\d/-]+/gi, '****')
      .replace(/\b\d+[\w\d/-]*/g, '****');
    if (masked === address && address.length > 10) {
      const words = address.split(' ');
      if (words.length >= 3) {
        return `${words[0]} **** ${words[words.length - 1]}`;
      }
      return `${address.slice(0, 4)} **** ${address.slice(-4)}`;
    }
    return masked;
  }
};

/**
 * Masking nomor telepon pasien (contoh: 081234567890 -> 0812****7890).
 */
export const maskPhone = (phone) => {
  if (!phone || phone.trim() === '' || phone === '-') return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  const visibleStart = digits.slice(0, 4);
  const visibleEnd = digits.slice(-4);
  const maskedLength = Math.max(digits.length - 8, 0);
  const masked = '*'.repeat(maskedLength || 4);
  return `${visibleStart}${masked}${visibleEnd}`;
};

/**
 * Menghilangkan karakter underscore dari kode kelas kamar.
 * Contoh: VIP_A -> VIP A
 */
export const formatRoomClass = (cls) => {
  if (!cls) return '';
  return cls.replace(/_/g, ' ');
};
