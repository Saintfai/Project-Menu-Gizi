import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  validateNote,
  validateMenuItemFields,
  isValidRMFormat,
} from '../inputValidator';

describe('Validasi & Sanitasi Input (Keamanan Data)', () => {
  describe('sanitizeText() - Pembersihan Karakter Berbahaya & XSS', () => {
    it('harus membuang tag HTML secara menyeluruh', () => {
      expect(sanitizeText('<b>Menu Sehat</b>')).toBe('Menu Sehat');
      expect(sanitizeText('<script>alert("XSS")</script>Nasi')).toBe('alert(XSS)Nasi');
    });

    it('harus membuang karakter berbahaya seperti tanda kutip dan kurung sudut', () => {
      const dirty = `Text dengan "kutip" dan 'petik' serta <tag>`;
      expect(sanitizeText(dirty)).not.toContain('"');
      expect(sanitizeText(dirty)).not.toContain("'");
      expect(sanitizeText(dirty)).not.toContain('<');
      expect(sanitizeText(dirty)).not.toContain('>');
    });

    it('harus memotong string sesuai batas maxLength', () => {
      const longText = 'A'.repeat(600);
      expect(sanitizeText(longText, 100).length).toBe(100);
    });

    it('harus mengembalikan string kosong jika input bukan string', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(12345)).toBe('');
    });
  });

  describe('validateNote() - Catatan Khusus Pesanan Pasien', () => {
    it('harus valid dan kosong jika catatan tidak diisi', () => {
      expect(validateNote('')).toEqual({ valid: true, sanitized: '' });
      expect(validateNote(null)).toEqual({ valid: true, sanitized: '' });
    });

    it('harus menerima catatan teks biasa yang bersih', () => {
      const note = 'Mohon kuah dipisah dan tanpa garam berlebih';
      const result = validateNote(note);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(note);
    });

    it('harus menolak input yang hanya berisi karakter ilegal / tag kosong', () => {
      const malicious = '<script></script>';
      const result = validateNote(malicious);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('isValidRMFormat() - Format Nomor Rekam Medis (RM)', () => {
    it('harus menerima format Nomor RM yang valid', () => {
      expect(isValidRMFormat('RM-12345')).toBe(true);
      expect(isValidRMFormat('rm-11111')).toBe(true);
      expect(isValidRMFormat('RM12345')).toBe(true);
      expect(isValidRMFormat('12345')).toBe(true);
      expect(isValidRMFormat('RM - 12345')).toBe(true);
    });

    it('harus menolak format Nomor RM yang tidak valid', () => {
      expect(isValidRMFormat('')).toBe(false);
      expect(isValidRMFormat(null)).toBe(false);
      expect(isValidRMFormat('ABCDE')).toBe(false);
      expect(isValidRMFormat('RM-')).toBe(false);
      expect(isValidRMFormat('RM-ABC123')).toBe(false);
    });
  });

  describe('validateMenuItemFields() - Validasi Master Menu Admin', () => {
    it('harus valid jika nama menu memenuhi syarat (minimal 2 karakter)', () => {
      const result = validateMenuItemFields({
        name: 'Ayam Panggang Bumbu Rujak',
        description: 'Ayam empuk dengan bumbu rempah pilihan',
        paketName: 'Paket A',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized.name).toBe('Ayam Panggang Bumbu Rujak');
    });

    it('harus menolak jika nama menu kosong atau kurang dari 2 karakter', () => {
      const result = validateMenuItemFields({
        name: 'A',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nama menu minimal 2 karakter.');
    });
  });
});
