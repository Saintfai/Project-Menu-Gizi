/**
 * Pengujian Unit: patientService
 * Menguji pembatasan hak akses pasien (khusus status VIP/Suite), aturan kelas titipan,
 * serta penolakan pasien kelas reguler (non-VIP) saat login mandiri.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientByRm, getPatientByNameAndDob, isVipPatient, getPatientsAllergiesMap, clearPatientCache, getTotalActivePatients } from '../patientService';
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

    it('menerima format Nomor RM asli rumah sakit seperti 00-05-10 dan membersihkannya saat query API', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 510,
          nama_pasien: 'PASIEN RM FORMAT ASLI',
          kelas: 'VIP A',
          titipan: null,
          kamar: 'VIP 1',
        },
      ]);

      const res = await getPatientByRm('00-05-10');
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/get-patient', { pid: '000510' });
      expect(res.type).toBe('single');
      expect(res.patient.name).toBe('PASIEN RM FORMAT ASLI');
    });

    it('menerima format RM dengan prefix RM- dan tanda strip', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 148194,
          nama_pasien: 'HASNA ANINDYA',
          kelas: 'VIP B',
          titipan: null,
          kamar: 'VIP 2',
        },
      ]);

      const res = await getPatientByRm('RM-14-81-94');
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/get-patient', { pid: '148194' });
      expect(res.type).toBe('single');
      expect(res.patient.name).toBe('HASNA ANINDYA');
    });

    it('menerima inputan angka biasa (seperti 510)', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 510,
          nama_pasien: 'PASIEN ANGKA BIASA',
          kelas: 'VIP A',
          titipan: null,
          kamar: 'VIP 1',
        },
      ]);

      const res = await getPatientByRm('510');
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/get-patient', { pid: '510' });
      expect(res.type).toBe('single');
      expect(res.patient.name).toBe('PASIEN ANGKA BIASA');
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

    it('mempertahankan tanggal lahir tahun kabisat & tahun lama pada pencarian Nama & Tgl Lahir maupun No. RM', async () => {
      // 1. Login via Nama & Tanggal Lahir (ketika response JSON API menggeser -1 hari menjadi 28-02-1948)
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: '48762',
          nama_pasien: 'IRFAN WIJAYA',
          tanggal_lahir: '28-02-1948',
          kelas: 'VIP C',
        },
      ]);

      const resByDob = await getPatientByNameAndDob('IRFAN WIJAYA', '1948-02-29');
      expect(resByDob.patient.dob).toBe('29-02-1948');

      // 2. Login via No. RM (rekonsiliasi otomatis H+1 ke endpoint get-patient-date-birth)
      apiClient.apiGet
        .mockResolvedValueOnce([
          {
            no_rm: '48762',
            nama_pasien: 'IRFAN WIJAYA',
            tanggal_lahir: '28-02-1948',
            kelas: 'VIP C',
          },
        ])
        .mockResolvedValueOnce([
          {
            no_rm: '48762',
            nama_pasien: 'IRFAN WIJAYA',
            tanggal_lahir: '28-02-1948',
            kelas: 'VIP C',
          },
        ]);

      const resByRm = await getPatientByRm('48762');
      expect(resByRm.patient.dob).toBe('29-02-1948');
    });
  });

  describe('patient allergies caching and clearPatientCache', () => {
    it('menggunakan cache untuk RM yang sama dan tidak memanggil API berulang kali', async () => {
      clearPatientCache();

      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 77777,
          nama_pasien: 'PASIEN CACHE TEST',
          kelas: 'VIP A',
          alergi: 'Udang',
        },
      ]);

      const map1 = await getPatientsAllergiesMap(['77777']);
      expect(map1.get('77777')?.allergies).toBe('Udang');
      expect(apiClient.apiGet).toHaveBeenCalledTimes(1);

      // Pemanggilan kedua harus langsung dari cache, tanpa memanggil apiGet lagi
      const map2 = await getPatientsAllergiesMap(['77777']);
      expect(map2.get('77777')?.allergies).toBe('Udang');
      expect(apiClient.apiGet).toHaveBeenCalledTimes(1);

      // Setelah cache dibersihkan, harus fetch ulang
      clearPatientCache();
      apiClient.apiGet.mockResolvedValueOnce([
        {
          no_rm: 77777,
          nama_pasien: 'PASIEN CACHE TEST',
          kelas: 'VIP A',
          alergi: 'Udang, Telur',
        },
      ]);
      const map3 = await getPatientsAllergiesMap(['77777']);
      expect(map3.get('77777')?.allergies).toBe('Udang, Telur');
      expect(apiClient.apiGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTotalActivePatients', () => {
    it('mengambil data total pasien aktif, kelas, dan VIP dengan format angka', async () => {
      apiClient.apiGet.mockResolvedValueOnce({
        total_pasien: '48',
        pasien_kelas: '23',
        pasien_vip: '25',
      });

      const res = await getTotalActivePatients();
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/total-pasien-aktif');
      expect(res).toEqual({
        totalPasien: 48,
        pasienKelas: 23,
        pasienVip: 25,
      });
    });

    it('mengembalikan fallback 0 jika respons server kosong atau error', async () => {
      apiClient.apiGet.mockRejectedValueOnce(new Error('Network error'));

      const res = await getTotalActivePatients();
      expect(res).toEqual({
        totalPasien: 0,
        pasienKelas: 0,
        pasienVip: 0,
      });
    });
  });
});

