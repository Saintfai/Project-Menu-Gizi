/**
 * Pengujian Unit: menuService
 * Menguji pembuatan hidangan menu gizi, konversi FormData, dan pengisian nilai default nutrisi.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiClient from '../apiClient';
import { createMenuItem, getActiveCycleMenuFast, getActiveCycleMenu } from '../menuService';

describe('menuService - createMenuItem', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Uji pengiriman data form-data lengkap ke endpoint webhook tambah menu
  it('mengirim form-data yang sesuai ke endpoint /webhook/add-menu-gizi', async () => {
    let capturedEndpoint = '';
    let capturedFormData = null;

    vi.spyOn(apiClient, 'apiPostFormData').mockImplementation(async (endpoint, formData) => {
      capturedEndpoint = endpoint;
      capturedFormData = formData;
      return { success: true, message: 'Menu added successfully' };
    });

    const menuData = {
      name: 'Nasi Kuning Komplit',
      cycleId: 1,
      mealTime: 'PAGI',
      paketName: 'Paket A',
      description: 'Nasi kuning disajikan dengan bihun goreng dan telur',
      karbohidrat: 'Nasi Kuning',
      protein: '-',
      nabati: 'Bihun Goreng',
      proteinTambahan: 'Telur Bumbu Semur',
      sayur: 'Kol',
    };

    const result = await createMenuItem(menuData);

    expect(capturedEndpoint).toBe('/webhook/add-menu-gizi');
    expect(capturedFormData).toBeInstanceOf(FormData);
    expect(capturedFormData.get('name')).toBe('Nasi Kuning Komplit');
    expect(capturedFormData.get('cycle_id')).toBe('1');
    expect(capturedFormData.get('meal_time')).toBe('PAGI');
    expect(capturedFormData.get('paket_name')).toBe('Paket A');
    expect(capturedFormData.get('description')).toBe('Nasi kuning disajikan dengan bihun goreng dan telur');
    expect(capturedFormData.get('karbohidrat')).toBe('Nasi Kuning');
    expect(capturedFormData.get('protein')).toBe('-');
    expect(capturedFormData.get('nabati')).toBe('Bihun Goreng');
    expect(capturedFormData.get('protein_tambahan')).toBe('Telur Bumbu Semur');
    expect(capturedFormData.get('sayur')).toBe('Kol');
    expect(result).toEqual({ success: true, message: 'Menu added successfully' });
  });

  // Uji pengisian tanda strip '-' otomatis jika field nutrisi tidak diisi oleh admin
  it('mengisi nilai default "-" untuk komponen nutrisi yang kosong', async () => {
    let capturedFormData = null;

    vi.spyOn(apiClient, 'apiPostFormData').mockImplementation(async (endpoint, formData) => {
      capturedFormData = formData;
      return { success: true };
    });

    await createMenuItem({
      name: 'Bubur Polos',
      cycleId: 3,
      mealTime: 'pagi',
      paketName: 'Paket B',
      description: '',
      karbohidrat: '',
      protein: null,
      nabati: undefined,
      proteinTambahan: '',
      sayur: '',
    });

    expect(capturedFormData.get('meal_time')).toBe('PAGI');
    expect(capturedFormData.get('karbohidrat')).toBe('-');
    expect(capturedFormData.get('protein')).toBe('-');
    expect(capturedFormData.get('nabati')).toBe('-');
    expect(capturedFormData.get('protein_tambahan')).toBe('-');
    expect(capturedFormData.get('sayur')).toBe('-');
  });

  describe('getActiveCycleMenuFast', () => {
    it('mengambil 11 item menu siklus aktif dari /webhook/menu-gizi-cycle', async () => {
      vi.spyOn(apiClient, 'apiGet').mockResolvedValueOnce([
        {
          mid: 4,
          name: 'Bubur Sumsum',
          cycle_id: 1,
          meal_time: 'PAGI',
          paket_name: 'Paket C',
          description: 'Bubur sumsum dengan kinca',
          karbohidrat: 'Bubur Sumsum',
          protein: '-',
          nabati: '-',
          protein_tambahan: 'Telur Rebus',
          sayur: '-',
        },
      ]);

      const items = await getActiveCycleMenuFast();
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/menu-gizi-cycle');
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(4);
      expect(items[0].name).toBe('Bubur Sumsum');
      expect(items[0].mealTime).toBe('PAGI');
      expect(items[0].paketName).toBe('Paket C');
    });

    it('fallback ke getMenuItemsByCycle jika endpoint /webhook/menu-gizi-cycle gagal', async () => {
      vi.spyOn(apiClient, 'apiGet')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          {
            mid: 10,
            name: 'Fallback Menu',
            cycle_id: 1,
            meal_time: 'SIANG',
            paket_name: 'Paket A',
          },
        ]);

      const items = await getActiveCycleMenuFast();
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/menu-gizi-cycle');
      expect(apiClient.apiGet).toHaveBeenCalledWith('/webhook/menu-gizi');
      expect(items.length).toBeGreaterThanOrEqual(0);
    });
  });
});
