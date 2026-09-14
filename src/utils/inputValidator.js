/**
 * NAMA FILE: inputValidator.js
 * FUNGSI UTAMA: Fungsi-fungsi utilitas pendukung (Helper Functions).
 * 
 * DETAIL:
 * - Berisi fungsi murni (pure functions) untuk pemformatan, validasi, atau komputasi umum.
 * - Dapat dipanggil dari berbagai bagian aplikasi untuk menghindari duplikasi kode.
 */



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
 * Validate menu item fields (nama menu, description, paketName).
 * Used by admin when creating or editing menu items.
 * @param {object} fields - { name, description, paketName }
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

  return {
    valid: errors.length === 0,
    sanitized,
    errors,
  };
}

/**
 * Validate RM number format.
 * Accepts: "12345", "RM-12345", "RM12345", "rm-12345"
 * @param {string} rm - RM number input
 * @returns {boolean}
 */
export function isValidRMFormat(rm) {
  if (!rm || typeof rm !== 'string') return false;
  const cleaned = rm.replace(/\s+/g, '');
  return /^(RM-?)?\d{1,10}$/i.test(cleaned);
}
