


export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')        // Strip HTML tags
    .replace(/[<>"'`]/g, '')        // Remove potentially dangerous characters
    .replace(/javascript:/gi, '')   // Remove javascript: URIs
    .replace(/on\w+\s*=/gi, '')     // Remove inline event handlers (onclick=, etc.)
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate patient order note (catatan khusus pesanan).
 * @param {string} note - The note text to validate
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
 * Validate menu item fields (nama menu, description, paketName, dan 5 kolom gizi).
 * Used by admin when creating or editing menu items.
 * @param {object} fields - { name, description, paketName, karbohidrat, protein, nabati, proteinTambahan, sayur }
 * @returns {{ valid: boolean, sanitized: object, errors: string[] }}
 */
export function validateMenuItemFields(fields) {
  const errors = [];
  const sanitized = {};

  // Name is required, minimum 2 characters
  if (!fields.name || fields.name.trim().length < 2) {
    errors.push('Nama menu minimal 2 karakter.');
  } else {
    sanitized.name = sanitizeText(fields.name, 100);
  }

  // Description is optional
  if (fields.description) {
    sanitized.description = sanitizeText(fields.description, 300);
  } else {
    sanitized.description = fields.description; // keep null/undefined/empty as-is
  }

  // Paket name is optional but if provided, sanitize it
  if (fields.paketName) {
    sanitized.paketName = sanitizeText(fields.paketName, 50);
  } else {
    sanitized.paketName = fields.paketName;
  }

  // ── 5 Kolom Gizi (semua opsional) ────────────────────────────────────
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
 * Validate RM number format.
 * Menerima format asli rumah sakit (contoh: "00-05-10", "14-81-94", "00.05.10", "RM-00-05-10")
 * maupun format angka biasa (contoh: "12345", "510", "000510", "RM-12345", "RM12345").
 * 
 * @param {string} rm - RM number input
 * @returns {boolean}
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
