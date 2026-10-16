/**
 * Utilitas Format Data Tampilan & Privasi Medis
 * Mengatur standarisasi format tanggal (DD/MM/YYYY), penyelarasan nama kelas kamar,
 * normalisasi & visualisasi Nomor RM, serta masking data privasi pasien (alamat & nomor telepon).
 */

/**
 * Memformat string tanggal (YYYY-MM-DD atau ISO string) ke format tampilan Indonesia DD/MM/YYYY.
 * 
 * @param {string | Date | null | undefined} dateString - String tanggal input
 * @returns {string} Tanggal terformat (DD/MM/YYYY) atau '-' jika tidak valid
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  if (typeof dateString === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateString.trim())) {
    const [d, m, y] = dateString.trim().split('-');
    return `${d}/${m}/${y}`;
  }
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return dateString;
  const d = dateObj.getDate().toString().padStart(2, '0');
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * Masking alamat pasien untuk menjaga privasi data medis (PII) pada tampilan publik/layar bersama.
 * 
 * @param {string | null | undefined} address - Alamat lengkap pasien
 * @returns {string} Alamat yang telah disamarkan dengan tanda bintang (****)
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
 * Masking nomor telepon pasien (contoh: 081234567890 -> 0812****7890) untuk perlindungan privasi.
 * 
 * @param {string | null | undefined} phone - Nomor telepon pasien
 * @returns {string} Nomor telepon tersamar
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
 * Menghilangkan karakter underscore dari kode kelas kamar database untuk ditampilkan rapi di UI.
 * Contoh: VIP_A -> VIP A, Kelas_1 -> Kelas 1
 * 
 * @param {string | null | undefined} cls - Nama/kode kelas kamar dari database
 * @returns {string} Nama kelas kamar yang rapi
 */
export const formatRoomClass = (cls) => {
  if (!cls) return '';
  return cls.replace(/_/g, ' ');
};

/**
 * Normalisasi input Nomor Rekam Medis (No. RM) agar dapat menerima format asli berpemisah
 * (contoh: "00-05-10", "14-81-94", "00.05.10") maupun format angka biasa (contoh: "510", "12345", "000510", "RM-12345").
 * 
 * Menghilangkan prefix "RM", spasi, tanda strip (-), dan titik (.).
 * 
 * @param {string | number | null | undefined} rm - Input Nomor RM
 * @returns {string} String nomor RM bersih (hanya digit)
 */
export const normalizeRM = (rm) => {
  if (rm === null || rm === undefined) return '';
  return String(rm)
    .replace(/^RM\s*-?\s*/i, '')
    .replace(/[-.\s]/g, '')
    .trim();
};

/**
 * Memformat Nomor RM ke format standar tampilan rumah sakit (XX-XX-XX).
 * Contoh: "510" atau "000510" -> "00-05-10", "148194" -> "14-81-94".
 * 
 * @param {string | number | null | undefined} rm - Nomor RM mentah
 * @returns {string} Nomor RM terformat atau '-' jika kosong
 */
export const formatRM = (rm) => {
  if (!rm) return '-';
  const clean = normalizeRM(rm);
  if (!clean || !/^\d+$/.test(clean)) return String(rm);
  if (clean.length <= 6) {
    const padded = clean.padStart(6, '0');
    return `${padded.slice(0, 2)}-${padded.slice(2, 4)}-${padded.slice(4, 6)}`;
  }
  if (clean.length <= 8) {
    const padded = clean.padStart(8, '0');
    return `${padded.slice(0, 2)}-${padded.slice(2, 4)}-${padded.slice(4, 6)}-${padded.slice(6, 8)}`;
  }
  return clean;
};
