import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrders } from '../orderService';
import * as apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  apiGet: vi.fn(),
  apiPostFormData: vi.fn(),
  apiPut: vi.fn(),
}));

describe('orderService - getOrders normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('melakukan fallback untuk data riwayat lama pada kelas non-VIP A (VIP C, Kelas 1-3) jika type null', async () => {
    // Pada PRD 3.2, kelas non-VIP A tidak memiliki kuota pendamping di Paket Utama Siang/Sore
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

    // Matching dengan 'RM-42689'
    const resWithRm = await getOrders({ patientId: 'RM-42689' });
    expect(resWithRm).toHaveLength(1);
    expect(resWithRm[0].id).toBe(40);

    // Matching dengan leading zeroes '042689'
    apiClient.apiGet.mockResolvedValueOnce([
      { id: 40, patient_id: 42689, meal_time: 'pagi' },
    ]);
    const resWithZero = await getOrders({ patientId: '042689' });
    expect(resWithZero).toHaveLength(1);
    expect(resWithZero[0].id).toBe(40);
  });

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

  it('memperkaya pesanan dengan riwayat alergi pasien jika withPatientAllergies true', async () => {
    // Mock 1: /webhook/all-order-item
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
});
