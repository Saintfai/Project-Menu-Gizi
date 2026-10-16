


/**
 * Utilitas Validasi & Sanitasi Input Formulir
 * Mengamankan masukan pengguna dari injeksi skrip berbahaya (XSS),
 * memvalidasi catatan pesanan pasien, field manajemen hidangan gizi, serta format Nomor RM.
 */

/**
 * Sanitasi string input untuk mencegah serangan XSS dan karakter berbahaya.
 * Menghapus tag HTML, event handler inline, skema javascript:, dan membatasi panjang teks.
 * 
 * @param {string} input - Teks input mentah
 * @param {number} [maxLength=500] - Batas panjang maksimal karakter
 * @returns {string} String yang telah dibersihkan
 */
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')        // Hapus tag HTML
    .replace(/[<>"'`]/g, '')        // Hapus karakter yang berpotensi membahayakan
    .replace(/javascript:/gi, '')   // Hapus URI javascript:
    .replace(/on\w+\s*=/gi, '')     // Hapus inline event handlers (onclick=, dsb.)
    .trim()
    .slice(0, maxLength);
}

/**
 * Validasi catatan khusus pesanan pasien (maksimal 300 karakter).
 * 
 * @param {string} note - Teks catatan yang akan divalidasi
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export function validateNote(note) {
  if (!note || note.trim() === '') {
    return { valid: true, sanitized: '' };
  }

  const sanitized = sanitizeText(note, 300);

  if (sanitized.length === 0) {
    return {
      valid: false,
      sanitized: '',
      error: 'Catatan mengandung karakter yang tidak diizinkan.',
    };
  }

  return { valid: true, sanitized };
}

/**
 * Validasi field formulir hidangan menu (nama menu, deskripsi, nama paket, dan 6 komponen gizi).
 * Digunakan oleh tim gizi saat menambah atau mengedit hidangan pada siklus menu.
 * 
 * @param {object} fields - Objek masukan menu { name, description, paketName, karbohidrat, protein, nabati, proteinTambahan, sayur, bentukMakanan }
 * @returns {{ valid: boolean, sanitized: object, errors: string[] }}
 */
export function validateMenuItemFields(fields) {
  const errors = [];
  const sanitized = {};

  // Nama hidangan wajib diisi, minimal 2 karakter
  if (!fields.name || fields.name.trim().length < 2) {
    errors.push('Nama menu minimal 2 karakter.');
  } else {
    sanitized.name = sanitizeText(fields.name, 100);
  }

  // Deskripsi hidangan bersifat opsional
  if (fields.description) {
    sanitized.description = sanitizeText(fields.description, 300);
  } else {
    sanitized.description = fields.description;
  }

  // Nama paket bersifat opsional, jika diisi tetap disanitasi
  if (fields.paketName) {
    sanitized.paketName = sanitizeText(fields.paketName, 50);
  } else {
    sanitized.paketName = fields.paketName;
  }

  // ── 6 Kolom Komponen Gizi (opsional) ────────────────────────────────────
  const nutrisiFields = ['karbohidrat', 'protein', 'nabati', 'proteinTambahan', 'sayur', 'bentukMakanan'];
  for (const field of nutrisiFields) {
    if (fields[field] && fields[field].trim() !== '') {
      sanitized[field] = sanitizeText(fields[field], 200);
    } else {
      sanitized[field] = null;
    }
  }

  return {
    valid: errors.length === 0,
    sanitized,
    errors,
  };
}

/**
 * Validasi keabsahan format Nomor Rekam Medis (No. RM).
 * Menerima format asli rumah sakit (contoh: "00-05-10", "14-81-94", "00.05.10", "RM-00-05-10")
 * maupun format angka biasa (contoh: "12345", "510", "000510", "RM-12345", "RM12345").
 * 
 * @param {string} rm - Masukan Nomor RM
 * @returns {boolean} True jika format Nomor RM valid
 */
export function isValidRMFormat(rm) {
  if (!rm || typeof rm !== 'string') return false;
  const trimmed = rm.trim();
  if (!trimmed) return false;

  // Hapus prefix RM (opsional, contoh: "RM-", "RM ", "rm-")
  const strippedPrefix = trimmed.replace(/^RM\s*-?\s*/i, '');
  if (!strippedPrefix) return false;

  // Tidak boleh ada separator beruntun (-- atau ..)
  if (/[-.]{2,}/.test(strippedPrefix)) return false;
  // Tidak boleh diawali atau diakhiri separator
  if (/^[-.]|[-.]$/.test(strippedPrefix)) return false;

  // Karakter yang diizinkan hanya digit, tanda strip (-), titik (.), dan spasi
  if (!/^[\d\-.\s]+$/.test(strippedPrefix)) return false;

  // Pastikan jumlah digit murni antara 1 hingga 12 digit
  const digits = strippedPrefix.replace(/[-.\s]/g, '');
  return digits.length >= 1 && digits.length <= 12;
}
