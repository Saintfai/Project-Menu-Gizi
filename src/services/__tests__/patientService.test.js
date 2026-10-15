/**
 * Pengujian Unit: patientService
 * Menguji pembatasan hak akses pasien (khusus status VIP/Suite), aturan kelas titipan,
 * serta penolakan pasien kelas reguler (non-VIP) saat login mandiri.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientByRm, getPatientByNameAndDob, isVipPatient } from '../patientService';
import * as apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  apiGet: vi.fn(),
  apiPostFormData: vi.fn(),
  apiPut: vi.fn(),
}));

describe('patientService - VIP only access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Uji logika helper isVipPatient untuk berbagai status kelas kamar
  describe('isVipPatient helper', () => {
    it('mengembalikan true untuk kelas VIP A, VIP B, VIP C, dan SUITE', () => {
      expect(isVipPatient({ kelas: 'VIP A' })).toBe(true);
      expect(isVipPatient({ kelas: 'VIP B' })).toBe(true);
      expect(isVipPatient({ kelas: 'VIP C' })).toBe(true);
      expect(isVipPatient({ kelas: 'SUITE' })).toBe(true);
      expect(isVipPatient({ kelas: 'VVIP' })).toBe(true);
    });

    it('mengembalikan true jika kelas asli Kelas 3 tetapi titipan VIP', () => {
      expect(isVipPatient({ kelas: 'KELAS 3', titipan: 'VIP A' })).toBe(true);
    });

    it('mengembalikan false untuk pasien berstatus Kelas 1, Kelas 2, Kelas 3 tanpa titipan VIP', () => {
      expect(isVipPatient({ kelas: 'KELAS 1', titipan: null })).toBe(false);
      expect(isVipPatient({ kelas: 'KELAS 2', titipan: '' })).toBe(false);
      expect(isVipPatient({ kelas: 'KELAS 3', titipan: null })).toBe(false);
      expect(isVipPatient({ kelas: 'Kelas 3' })).toBe(false);
    });
  });

  // Uji pembatasan akses VIP saat login menggunakan Nomor Rekam Medis (No. RM)
  describe('getPatientByRm VIP enforcement', () => {
    it('menolak pasien berstatus Kelas dan melemparkan error "Data pasien tidak ditemukan."', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 40430,
          nama_pasien: 'MUHAMMAD AULIAN BASIRA',
          kelas: 'KELAS 3',
          titipan: null,
          kamar: 'ROSE 6 - 6.2',
        },
      ]);

      await expect(getPatientByRm(40430)).rejects.toThrow('Data pasien tidak ditemukan.');
    });

    it('menerima pasien berstatus VIP', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 99999,
          nama_pasien: 'SULTAN VIP',
          kelas: 'VIP A',
          titipan: null,
          kamar: 'EDELWEISS 1',
        },
      ]);

      const res = await getPatientByRm(99999);
      expect(res.type).toBe('single');
      expect(res.patient.name).toBe('SULTAN VIP');
      expect(res.patient.roomClass).toBe('VIP A');
    });

    it('dapat mengambil data pasien non-VIP jika opsi vipOnly diset false (untuk keperluan rekap dapur)', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 40430,
          nama_pasien: 'MUHAMMAD AULIAN BASIRA',
          kelas: 'KELAS 3',
          titipan: null,
          kamar: 'ROSE 6 - 6.2',
        },
      ]);

      const res = await getPatientByRm(40430, { vipOnly: false });
      expect(res.type).toBe('single');
      expect(res.patient.name).toBe('MUHAMMAD AULIAN BASIRA');
    });
  });

  // Uji pembatasan akses VIP saat login menggunakan Nama dan Tanggal Lahir
  describe('getPatientByNameAndDob VIP enforcement', () => {
    it('menolak pasien Kelas saat dicari berdasarkan nama dan tanggal lahir', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 40430,
          nama_pasien: 'MUHAMMAD AULIAN BASIRA',
          tanggal_lahir: '04-02-2022',
          kelas: 'KELAS 3',
        },
      ]);

      await expect(
        getPatientByNameAndDob('MUHAMMAD', '04-02-2022')
      ).rejects.toThrow('Data pasien tidak ditemukan.');
    });

    it('menerima pasien VIP saat dicari berdasarkan nama dan tanggal lahir', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 88888,
          nama_pasien: 'PASIEN VIP',
          tanggal_lahir: '10-10-1990',
          kelas: 'VIP B',
        },
      ]);

      const res = await getPatientByNameAndDob('PASIEN VIP', '10-10-1990');
      expect(res.type).toBe('single');
      expect(res.patient.name).toBe('PASIEN VIP');
    });
  });
});
