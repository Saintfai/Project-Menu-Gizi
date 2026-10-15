/**
 * Pengujian Unit: formatters
 * Menguji helper formatting data dan masking data pribadi pasien (PII)
 * seperti nomor telepon, nomor/blok alamat, dan standarisasi nama kelas kamar.
 */

import { describe, it, expect } from 'vitest';
import { formatDate, maskAddress, maskPhone, formatRoomClass, normalizeRM, formatRM } from '../formatters';

describe('Formatters & Masking Data Privasi Pasien (PII)', () => {
  // Uji formatting tanggal ke standar format Indonesia (DD/MM/YYYY)
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

  // Uji penyensoran (masking) nomor kontak telepon demi privasi pasien
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

  // Uji penyensoran (masking) nomor rumah dan blok pada alamat pasien
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

  // Uji format tampilan nama kelas kamar (mengubah format snake_case ke spasi)
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

  // Uji normalisasi nomor RM (menerima format asli rumah sakit dan angka biasa)
  describe('normalizeRM() - Normalisasi Nomor RM', () => {
    it('harus membersihkan format asli RM dengan tanda strip (-)', () => {
      expect(normalizeRM('00-05-10')).toBe('000510');
      expect(normalizeRM('14-81-94')).toBe('148194');
      expect(normalizeRM('08-22-19')).toBe('082219');
    });

    it('harus membersihkan format dengan pemisah titik (.) dan spasi', () => {
      expect(normalizeRM('00.05.10')).toBe('000510');
      expect(normalizeRM('00 05 10')).toBe('000510');
    });

    it('harus membersihkan prefix RM-', () => {
      expect(normalizeRM('RM-00-05-10')).toBe('000510');
      expect(normalizeRM('RM-12345')).toBe('12345');
      expect(normalizeRM('RM 12345')).toBe('12345');
    });

    it('harus tetap menerima inputan angka biasa', () => {
      expect(normalizeRM('510')).toBe('510');
      expect(normalizeRM('12345')).toBe('12345');
      expect(normalizeRM(219)).toBe('219');
    });

    it('harus mengembalikan string kosong jika input null, undefined, atau kosong', () => {
      expect(normalizeRM(null)).toBe('');
      expect(normalizeRM(undefined)).toBe('');
      expect(normalizeRM('')).toBe('');
    });
  });

  // Uji formatting tampilan nomor RM ke format standar XX-XX-XX
  describe('formatRM() - Standarisasi Format Tampilan Nomor RM', () => {
    it('harus memformat angka biasa ke format XX-XX-XX', () => {
      expect(formatRM('510')).toBe('00-05-10');
      expect(formatRM(219)).toBe('00-02-19');
      expect(formatRM('82219')).toBe('08-22-19');
      expect(formatRM('148194')).toBe('14-81-94');
    });

    it('harus mempertahankan format asli jika sudah sesuai', () => {
      expect(formatRM('00-05-10')).toBe('00-05-10');
    });

    it('harus mengembalikan tanda strip (-) jika nilai kosong', () => {
      expect(formatRM(null)).toBe('-');
      expect(formatRM(undefined)).toBe('-');
      expect(formatRM('')).toBe('-');
    });
  });
});
