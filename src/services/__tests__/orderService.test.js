/**
 * Pengujian Unit: orderService
 * Menguji normalisasi pesanan dari API RS, fallback tipe pesanan (INCLUDE/EXCLUDE),
 * filtering multi-kriteria (RM, tanggal, noreg), enrichment alergi, dan integrasi penyimpanan lokal.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrders, getTodayOrders, deleteOrderItem, getChefDailyNote, saveChefDailyNote, getTomorrowServingDate, getTodayServingDate, syncPatientOrder } from '../orderService';
import * as apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  apiFetch: vi.fn(),
  apiGet: vi.fn(),
  apiPostFormData: vi.fn(),
  apiPut: vi.fn(),
}));

describe('orderService - getOrders normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Uji prioritas tipe resmi API jika field 'type' sudah tersedia
  it('menggunakan nilai type resmi dari API (INCLUDE / EXCLUDE)', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 1,
        order_id: 'ORD-101',
        patient_id: 100,
        consumer: 'pasien',
        meal_time: 'siang',
        type: 'include',
      },
      {
        id: 2,
        order_id: 'ORD-101',
        patient_id: 100,
        consumer: 'pendamping',
        meal_time: 'siang',
        type: 'exclude',
      },
    ]);

    const result = await getOrders();
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('INCLUDE');
    expect(result[1].type).toBe('EXCLUDE');
  });

  // Uji fallback tipe pesanan riwayat lama untuk kelas reguler non-VIP A
  it('melakukan fallback untuk data riwayat lama pada kelas non-VIP A (VIP C, Kelas 1-3) jika type null', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 20,
        order_id: 'ORD-103',
        patient_id: 300,
        consumer: 'pasien',
        class_type: 'VIP C',
        meal_time: 'siang',
        type: null,
      },
      {
        id: 21,
        order_id: 'ORD-103',
        patient_id: 300,
        consumer: 'pendamping',
        class_type: 'VIP C',
        meal_time: 'siang',
        type: null,
      },
    ]);

    const result = await getOrders();
    expect(result[0].type).toBe('INCLUDE');
    expect(result[1].type).toBe('EXCLUDE');
  });

  // Uji fallback tipe pesanan riwayat lama untuk kelas VIP A (jatah pendamping kedua = EXCLUDE)
  it('melakukan fallback untuk data riwayat lama pada kelas VIP A jika kolom type bernilai null', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 30,
        order_id: 'ORD-104',
        patient_id: 400,
        consumer: 'pendamping',
        class_type: 'VIP A',
        meal_time: 'siang',
        type: null,
      },
      {
        id: 31,
        order_id: 'ORD-104',
        patient_id: 400,
        consumer: 'pendamping',
        class_type: 'VIP A',
        meal_time: 'siang',
        type: null,
      },
    ]);

    const result = await getOrders();
    expect(result[0].type).toBe('INCLUDE');
    expect(result[1].type).toBe('EXCLUDE');
  });

  // Uji fleksibilitas pencarian ID Pasien dengan format RM-, angka murni, atau leading zeroes
  it('memfilter patientId secara tangguh dengan format RM-, leading zeroes, atau numeric', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 40,
        patient_id: 42689,
        order_id: 'ORD-40',
        meal_time: 'pagi',
      },
      {
        id: 41,
        patient_id: 99999,
        order_id: 'ORD-41',
        meal_time: 'pagi',
      },
    ]);

    // Pencarian dengan prefix 'RM-42689'
    const resWithRm = await getOrders({ patientId: 'RM-42689' });
    expect(resWithRm).toHaveLength(1);
    expect(resWithRm[0].id).toBe(40);

    // Pencarian dengan format leading zeroes '042689'
    apiClient.apiGet.mockResolvedValueOnce([
      { id: 40, patient_id: 42689, meal_time: 'pagi' },
    ]);
    const resWithZero = await getOrders({ patientId: '042689' });
    expect(resWithZero).toHaveLength(1);
    expect(resWithZero[0].id).toBe(40);
  });

  // Uji akurasi filter tanggal penyajian (T+1) terlepas dari perbedaan zona waktu
  it('memfilter servingDate dengan tepat terlepas dari zona waktu UTC atau format string', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 50,
        patient_id: 1,
        serving_date: '2026-10-09T05:00:00.000Z', // 12:00 WIB
        meal_time: 'siang',
      },
      {
        id: 51,
        patient_id: 1,
        serving_date: '2026-10-10T05:00:00.000Z',
        meal_time: 'siang',
      },
    ]);

    const res = await getOrders({ servingDate: '2026-10-09' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(50);
  });

  // Uji penggabungan data riwayat alergi pasien dari endpoint /webhook/get-patient
  it('memperkaya pesanan dengan riwayat alergi pasien jika withPatientAllergies true', async () => {
    apiClient.apiGet.mockImplementation(async (endpoint, params) => {
      if (endpoint === '/webhook/all-order-item') {
        return [
          {
            id: 60,
            order_id: 'ORD-60',
            patient_id: 12345,
            consumer_name: 'Pasien Uji',
            meal_time: 'pagi',
          },
        ];
      }
      if (endpoint === '/webhook/get-patient' && params?.pid === '12345') {
        return [
          {
            no_rm: 12345,
            nama_pasien: 'Pasien Uji',
            alergi: 'Seafood, Telur',
          },
        ];
      }
      return [];
    });

    const res = await getOrders({ withPatientAllergies: true });
    expect(res).toHaveLength(1);
    expect(res[0].allergies).toBe('Seafood, Telur');
    expect(res[0].patient?.allergies).toBe('Seafood, Telur');
  });

  // Uji normalisasi dan filter berdasarkan nomor registrasi (noreg / noReg)
  it('menormalisasi dan memfilter atribut noreg / noReg dari respons API', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 70,
        patient_id: 40430,
        noreg: '2610140210',
        order_id: 'ORD-70',
        meal_time: 'pagi',
      },
      {
        id: 71,
        patient_id: 82219,
        noreg: '2610130465',
        order_id: 'ORD-71',
        meal_time: 'pagi',
      },
    ]);

    const res = await getOrders({ noReg: '2610140210' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(70);
    expect(res[0].noReg).toBe('2610140210');
    expect(res[0].noreg).toBe('2610140210');
  });

  // Uji pengiriman parameter noreg ke server via FormData
  it('createOrders menyertakan noreg, no_reg, dan no_regis dalam FormData', async () => {
    let capturedFormData = null;
    apiClient.apiPostFormData.mockImplementation(async (endpoint, formData) => {
      capturedFormData = formData;
      return { success: true };
    });

    // Mock verifyOrderPersisted: simulasikan server sudah menyimpan pesanan
    apiClient.apiGet.mockResolvedValue([
      {
        id: 1,
        order_id: 'ORD-TEST-001',
        patient_id: '40430',
        meal_time: 'pagi',
        type: 'include',
      },
    ]);

    const { createOrders } = await import('../orderService');

    await createOrders([
      {
        orderId: 'ORD-TEST-001',
        patientId: '40430',
        noReg: '2610140210',
        mealTime: 'PAGI',
        menuName: 'Nasi Centil',
        quantity: 1,
      },
    ]);

    expect(capturedFormData).not.toBeNull();
    expect(capturedFormData.get('noreg')).toBe('2610140210');
    expect(capturedFormData.get('no_reg')).toBe('2610140210');
    expect(capturedFormData.get('no_regis')).toBe('2610140210');
  });

  // Uji bahwa getOrders murni mengembalikan data dari server (tanpa local orders)
  it('getOrders hanya mengembalikan data dari server (tanpa local orders)', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 1,
        order_id: 'ORD-SERVER-001',
        patient_id: 82219,
        meal_time: 'pagi',
        type: 'include',
      },
    ]);

    const result = await getOrders();
    expect(result).toHaveLength(1);
    expect(result[0].orderCode).toBe('ORD-SERVER-001');
  });

  it('createOrders melempar error jika verifikasi server gagal', async () => {
    apiClient.apiPostFormData.mockResolvedValue({ success: true });

    // Mock verifyOrderPersisted: server tidak menyimpan pesanan (empty array)
    apiClient.apiGet.mockResolvedValue([]);

    const { createOrders } = await import('../orderService');

    await expect(
      createOrders([
        {
          orderId: 'ORD-FAIL-001',
          patientId: '12345',
          mealTime: 'PAGI',
          menuName: 'Test Menu',
          quantity: 1,
        },
      ])
    ).rejects.toThrow('belum terverifikasi');
  }, 15000);

  it('checkPatientHasOrderedMain mendeteksi pesanan yang ada di database server', async () => {
    const { checkPatientHasOrderedMain } = await import('../orderService');

    apiClient.apiGet.mockResolvedValue([
      {
        id: 226,
        order_id: 'ORD-20261015-148075-5231',
        patient_id: 148075,
        noreg: '2610110116',
        serving_date: '2026-10-16T05:00:00.000Z',
        type: 'include',
      },
    ]);

    // Cocok dengan ID
    const hasOrderedById = await checkPatientHasOrderedMain('148075', '2026-10-16');
    expect(hasOrderedById).toBe(true);

    // Cocok dengan noReg
    const hasOrderedByReg = await checkPatientHasOrderedMain('RM-148075', '2026-10-16', '2610110116');
    expect(hasOrderedByReg).toBe(true);

    // Pasien lain tidak terdeteksi
    const otherPatient = await checkPatientHasOrderedMain('999999', '2026-10-16');
    expect(otherPatient).toBe(false);

    // Tanggal berbeda tidak terdeteksi
    const differentDate = await checkPatientHasOrderedMain('148075', '2026-10-20');
    expect(differentDate).toBe(false);
  });

  describe('getTodayOrders', () => {
    it('mengambil pesanan dari endpoint /webhook/order-item-hari dan menormalisasinya', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        {
          id: 389,
          patient_id: 148329,
          room_number: 'JASMINE 5 - 5.3',
          class_type: 'KELAS 2 | ',
          notes: '',
          consumer: 'pasien',
          consumer_name: 'EUIS LISNAWATI',
          meal_time: 'SORE',
          menu_name: 'Beef Teriyaki',
          paket_name: 'Paket A',
          serving_date: '2026-10-21T17:00:00.000Z',
          order_id: 'ORD-20261021-148329-4015',
          type: 'include',
        },
      ]);

      const orders = await getTodayOrders();
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/order-item-hari');
      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(389);
      expect(orders[0].patientName).toBe('EUIS LISNAWATI');
      expect(orders[0].mealTime).toBe('SORE');
      expect(orders[0].type).toBe('INCLUDE');
    });
  });

  describe('deleteOrderItem', () => {
    it('mengirim request POST ke /webhook/hapus-order-item?id={id}', async () => {
      apiClient.apiFetch.mockResolvedValueOnce([{ success: true }]);

      const res = await deleteOrderItem(389);
      expect(apiClient.apiFetch).toHaveBeenCalledWith(
        '/webhook/hapus-order-item?id=389',
        expect.objectContaining({ method: 'POST' })
      );
      expect(res).toEqual([{ success: true }]);
    });

    it('melempar error jika ID pesanan tidak disertakan', async () => {
      await expect(deleteOrderItem('')).rejects.toThrow('ID item pesanan wajib diisi.');
      await expect(deleteOrderItem(null)).rejects.toThrow('ID item pesanan wajib diisi.');
    });
  });

  describe('getChefDailyNote & saveChefDailyNote', () => {
    it('mengambil catatan koki dari server dan menormalisasinya', async () => {
      apiClient.apiGet.mockResolvedValueOnce({
        id: 2,
        serving_date: '21-10-2026',
        note: 'Porsi sup dipisah untuk kamar 302',
      });

      const res = await getChefDailyNote('2026-10-21');
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/note-chef');
      expect(res.note).toBe('Porsi sup dipisah untuk kamar 302');
      expect(res.servingDate).toBe('21-10-2026');
    });

    it('mendukung respons berupa array dari server', async () => {
      apiClient.apiGet.mockResolvedValueOnce([
        { id: 1, serving_date: '20-10-2026', note: 'Catatan lama' },
        { id: 2, serving_date: '21-10-2026', note: 'Catatan baru T+1' },
      ]);

      const res = await getChefDailyNote('2026-10-21');
      expect(res.note).toBe('Catatan baru T+1');
    });

    it('menyimpan catatan koki ke server dengan multipart FormData dan format tanggal DD-MM-YYYY', async () => {
      apiClient.apiPostFormData.mockResolvedValueOnce({ success: true });

      const res = await saveChefDailyNote('Bubur encer untuk VIP Suite', '2026-10-22');
      expect(apiClient.apiPostFormData).toHaveBeenCalledWith(
        '/webhook/note-chef',
        expect.any(FormData)
      );
      expect(res.success).toBe(true);
      expect(res.note).toBe('Bubur encer untuk VIP Suite');
      expect(res.servingDate).toBe('22-10-2026');
    });

    it('tidak mengembalikan catatan tanggal lain jika tanggal yang diminta berbeda (isolasi per hari)', async () => {
      apiClient.apiGet.mockResolvedValueOnce({
        id: 99,
        serving_date: '21-10-2026',
        note: 'Catatan untuk hari 21',
      });

      // Minta untuk tanggal 22-10-2026
      const res = await getChefDailyNote('2026-10-22');
      expect(res.note).toBe('');
      expect(res.source).toBe('empty');
      expect(res.servingDate).toBe('22-10-2026');
    });
  });

  describe('Serving Date Helpers', () => {
    it('getTodayServingDate mengembalikan string tanggal YYYY-MM-DD yang valid', () => {
      const today = getTodayServingDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('getTomorrowServingDate mengembalikan string tanggal YYYY-MM-DD yang valid (T+1)', () => {
      const tomorrow = getTomorrowServingDate();
      expect(tomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const today = getTodayServingDate();
      expect(tomorrow).not.toBe(today);
    });
  });

  describe('syncPatientOrder() - Sinkronisasi Pasien Baru SIMRS', () => {
    it('berhasil memanggil webhook sync-data-tera dengan parameter no_regis', async () => {
      apiClient.apiGet.mockResolvedValueOnce({
        status: 'success',
        message: 'Registration synchronized',
      });

      const res = await syncPatientOrder('2610140210');
      expect(res.success).toBe(true);
      expect(res.noRegis).toBe('2610140210');
      expect(apiClient.apiGet).toHaveBeenCalledWith(
        '/webhook/sync-data-tera',
        expect.objectContaining({
          no_regis: '2610140210',
          noreg: '2610140210',
        })
      );
    });

    it('mendukung pemanggilan dengan objek row yang memiliki no_regis dan patientId', async () => {
      apiClient.apiGet.mockResolvedValueOnce({
        status: 'success',
      });

      const row = {
        no_regis: '2610140210',
        patientId: '146027',
        patientName: 'muncang',
      };

      const res = await syncPatientOrder(row);
      expect(res.success).toBe(true);
      expect(res.noRegis).toBe('2610140210');
      expect(res.patientId).toBe('146027');
    });

    it('melempar error jika nomor registrasi kosong', async () => {
      await expect(syncPatientOrder('')).rejects.toThrow('Nomor registrasi pasien wajib diisi');
      await expect(syncPatientOrder(null)).rejects.toThrow('Nomor registrasi pasien wajib diisi');
    });

    it('melempar error jika semua percobaan retry gagal', async () => {
      apiClient.apiGet.mockRejectedValue(new Error('Network error 500'));

      await expect(syncPatientOrder('2610140210', 1)).rejects.toThrow('Gagal menyinkronisasi data registrasi 2610140210');
    });
  });
});

