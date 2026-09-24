import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkMainMealCutoff, getCurrentWIBHour } from '../cutoffValidator';

describe('Batas Waktu Cut-Off Pemesanan (PRD 3.2 & 3.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getCurrentWIBHour()', () => {
    it('harus mengonversi waktu UTC ke WIB (UTC+7) dengan benar', () => {
      // 03:00 UTC = 10:00 WIB
      vi.setSystemTime(new Date('2026-09-24T03:00:00Z'));
      expect(getCurrentWIBHour()).toBe(10);

      // 08:00 UTC = 15:00 WIB
      vi.setSystemTime(new Date('2026-09-24T08:00:00Z'));
      expect(getCurrentWIBHour()).toBe(15);

      // 20:00 UTC = 03:00 WIB (hari berikutnya)
      vi.setSystemTime(new Date('2026-09-24T20:00:00Z'));
      expect(getCurrentWIBHour()).toBe(3);
    });
  });

  describe('checkMainMealCutoff() - Paket Utama Maksimal 15:00 WIB', () => {
    it('harus berstatus isPastCutoff = false jika waktu masih sebelum 15:00 WIB', () => {
      // 07:30 UTC = 14:30 WIB
      vi.setSystemTime(new Date('2026-09-24T07:30:00Z'));
      const status = checkMainMealCutoff();

      expect(status.isPastCutoff).toBe(false);
      expect(status.cutoffTimeText).toBe('15:00 WIB');
      expect(status.currentTimeWIB).toBe('14:30 WIB');
    });

    it('harus berstatus isPastCutoff = true tepat pada pukul 15:00 WIB', () => {
      // 08:00 UTC = 15:00 WIB
      vi.setSystemTime(new Date('2026-09-24T08:00:00Z'));
      const status = checkMainMealCutoff();

      expect(status.isPastCutoff).toBe(true);
      expect(status.currentTimeWIB).toBe('15:00 WIB');
    });

    it('harus berstatus isPastCutoff = true jika waktu sudah lewat dari 15:00 WIB', () => {
      // 09:15 UTC = 16:15 WIB
      vi.setSystemTime(new Date('2026-09-24T09:15:00Z'));
      const status = checkMainMealCutoff();

      expect(status.isPastCutoff).toBe(true);
      expect(status.currentTimeWIB).toBe('16:15 WIB');
    });
  });

  describe('Validasi Cut-off Bertingkat (PRD 3.3)', () => {
    it('pada jam 09:00 WIB: Paket Utama, Ekstra Siang, dan Ekstra Sore semua terbuka', () => {
      // 02:00 UTC = 09:00 WIB
      vi.setSystemTime(new Date('2026-09-24T02:00:00Z'));
      const currentHour = getCurrentWIBHour();

      const isMainLocked = currentHour >= 15;
      const isExtraSiangLocked = currentHour >= 10;
      const isExtraSoreLocked = currentHour >= 14;

      expect(isMainLocked).toBe(false);
      expect(isExtraSiangLocked).toBe(false);
      expect(isExtraSoreLocked).toBe(false);
    });

    it('pada jam 11:00 WIB: Ekstra Siang terkunci (>= 10:00 WIB), lainnya masih terbuka', () => {
      // 04:00 UTC = 11:00 WIB
      vi.setSystemTime(new Date('2026-09-24T04:00:00Z'));
      const currentHour = getCurrentWIBHour();

      const isMainLocked = currentHour >= 15;
      const isExtraSiangLocked = currentHour >= 10;
      const isExtraSoreLocked = currentHour >= 14;

      expect(isMainLocked).toBe(false);
      expect(isExtraSiangLocked).toBe(true); // Ekstra Siang ditutup
      expect(isExtraSoreLocked).toBe(false);
    });

    it('pada jam 14:30 WIB: Ekstra Siang & Ekstra Sore terkunci, Paket Utama masih terbuka', () => {
      // 07:30 UTC = 14:30 WIB
      vi.setSystemTime(new Date('2026-09-24T07:30:00Z'));
      const currentHour = getCurrentWIBHour();

      const isMainLocked = currentHour >= 15;
      const isExtraSiangLocked = currentHour >= 10;
      const isExtraSoreLocked = currentHour >= 14;

      expect(isMainLocked).toBe(false); // Paket utama masih bisa sampai 15:00
      expect(isExtraSiangLocked).toBe(true);
      expect(isExtraSoreLocked).toBe(true); // Ekstra Sore ditutup
    });

    it('pada jam 16:00 WIB: Seluruh pemesanan terkunci', () => {
      // 09:00 UTC = 16:00 WIB
      vi.setSystemTime(new Date('2026-09-24T09:00:00Z'));
      const currentHour = getCurrentWIBHour();

      expect(currentHour >= 15).toBe(true);
      expect(currentHour >= 10).toBe(true);
      expect(currentHour >= 14).toBe(true);
    });
  });
});
