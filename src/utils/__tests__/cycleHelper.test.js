import { describe, it, expect } from 'vitest';
import { getMenuCycleByDate, getTomorrowServingDate } from '../cycleHelper';

describe('Logika Siklus Menu (PRD 3.2)', () => {
  describe('getMenuCycleByDate()', () => {
    it('harus memetakan tanggal 1 s.d. 10 ke Siklus 1 s.d. 10', () => {
      expect(getMenuCycleByDate(new Date('2026-09-01'))).toBe(1);
      expect(getMenuCycleByDate(new Date('2026-09-05'))).toBe(5);
      expect(getMenuCycleByDate(new Date('2026-09-10'))).toBe(10);
    });

    it('harus berulang ke Siklus 1 s.d. 10 untuk tanggal 11 s.d. 20', () => {
      expect(getMenuCycleByDate(new Date('2026-09-11'))).toBe(1);
      expect(getMenuCycleByDate(new Date('2026-09-15'))).toBe(5);
      expect(getMenuCycleByDate(new Date('2026-09-20'))).toBe(10);
    });

    it('harus berulang ke Siklus 1 s.d. 10 untuk tanggal 21 s.d. 30', () => {
      expect(getMenuCycleByDate(new Date('2026-09-21'))).toBe(1);
      expect(getMenuCycleByDate(new Date('2026-09-25'))).toBe(5);
      expect(getMenuCycleByDate(new Date('2026-09-30'))).toBe(10);
    });

    it('harus menghasilkan Siklus 11 KHUSUS pada tanggal 31', () => {
      expect(getMenuCycleByDate(new Date('2026-08-31'))).toBe(11);
      expect(getMenuCycleByDate(new Date('2026-10-31'))).toBe(11);
      expect(getMenuCycleByDate(new Date('2026-12-31'))).toBe(11);
    });

    it('harus mendukung input berupa string tanggal ISO / format YYYY-MM-DD', () => {
      expect(getMenuCycleByDate('2026-09-08')).toBe(8);
      expect(getMenuCycleByDate('2026-10-31')).toBe(11);
    });

    it('harus menggunakan T+1 (esok hari) secara default jika tanpa parameter', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expectedCycle = getMenuCycleByDate(tomorrow);

      expect(getMenuCycleByDate()).toBe(expectedCycle);
    });
  });

  describe('getTomorrowServingDate()', () => {
    it('harus menghasilkan tanggal esok hari (T+1) dengan format YYYY-MM-DD', () => {
      const tomorrowStr = getTomorrowServingDate();
      expect(tomorrowStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pad = (n) => String(n).padStart(2, '0');
      const expected = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

      expect(tomorrowStr).toBe(expected);
    });
  });
});
