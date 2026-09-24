import { describe, it, expect } from 'vitest';
import { formatDate, maskAddress, maskPhone, formatRoomClass } from '../formatters';

describe('Formatters & Masking Data Privasi Pasien (PII)', () => {
  describe('formatDate() - Format Tanggal Indonesia DD/MM/YYYY', () => {
    it('harus memformat string ISO ke DD/MM/YYYY', () => {
      expect(formatDate('2026-09-25T00:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/2026/);
    });

    it('harus memformat objek Date dengan benar', () => {
      const date = new Date(2026, 8, 25); // 25 Sep 2026
      expect(formatDate(date)).toBe('25/09/2026');
    });

    it('harus mengembalikan tanda strip (-) jika tanggal null/undefined/kosong', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('')).toBe('-');
    });
  });

  describe('maskPhone() - Perlindungan Privasi Nomor Telepon', () => {
    it('harus menyamarkan digit tengah nomor telepon dengan tanda bintang (*)', () => {
      const masked = maskPhone('081234567890');
      expect(masked.startsWith('0812')).toBe(true);
      expect(masked.endsWith('7890')).toBe(true);
      expect(masked).toContain('****');
    });

    it('harus mengembalikan tanda strip (-) jika nomor telepon kosong', () => {
      expect(maskPhone(null)).toBe('-');
      expect(maskPhone('')).toBe('-');
      expect(maskPhone('-')).toBe('-');
    });

    it('harus mengembalikan nomor apa adanya jika terlalu pendek (<= 4 digit)', () => {
      expect(maskPhone('123')).toBe('123');
    });
  });

  describe('maskAddress() - Perlindungan Privasi Alamat Pasien', () => {
    it('harus menyamarkan nomor/blok pada alamat lengkap', () => {
      const address = 'Komplek Dago Resort, Cluster Pine Hill Blok B2 No. 15, Cibeunying Kaler, Bandung';
      const masked = maskAddress(address);

      expect(masked).toContain('****');
      expect(masked).not.toContain('No. 15');
      expect(masked).not.toContain('Blok B2');
    });

    it('harus mengembalikan tanda strip (-) jika alamat kosong atau nihil', () => {
      expect(maskAddress(null)).toBe('-');
      expect(maskAddress('')).toBe('-');
      expect(maskAddress('-')).toBe('-');
    });
  });

  describe('formatRoomClass() - Pembersihan Kode Kelas Kamar', () => {
    it('harus mengubah underscore menjadi spasi untuk tampilan UI', () => {
      expect(formatRoomClass('VIP_A')).toBe('VIP A');
      expect(formatRoomClass('Kelas_1')).toBe('Kelas 1');
      expect(formatRoomClass('JUNIOR_SUITE')).toBe('JUNIOR SUITE');
    });

    it('harus mengembalikan string kosong jika null atau undefined', () => {
      expect(formatRoomClass(null)).toBe('');
      expect(formatRoomClass(undefined)).toBe('');
    });
  });
});
