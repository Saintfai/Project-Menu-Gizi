import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiClient from '../apiClient';
import { createMenuItem } from '../menuService';

describe('menuService - createMenuItem', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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
});
