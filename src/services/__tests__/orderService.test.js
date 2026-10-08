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

  it('melakukan fallback untuk data riwayat lama jika kolom type bernilai null', async () => {
    apiClient.apiGet.mockResolvedValueOnce([
      {
        id: 30,
        order_id: 'ORD-104',
        patient_id: 400,
        consumer: 'pendamping',
        meal_time: 'siang',
        type: null,
      },
      {
        id: 31,
        order_id: 'ORD-104',
        patient_id: 400,
        consumer: 'pendamping',
        meal_time: 'siang',
        type: null,
      },
    ]);

    const result = await getOrders();
    expect(result[0].type).toBe('INCLUDE');
    expect(result[1].type).toBe('EXCLUDE');
  });
});
