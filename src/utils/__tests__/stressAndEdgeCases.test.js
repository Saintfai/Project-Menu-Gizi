import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCurrentWIBHour, checkMainMealCutoff } from '../cutoffValidator';
import { groupOrdersForTable, formatMealColumn, hasRealAllergy } from '../orderTransformer';
import { validateNote } from '../inputValidator';

describe('Skenario Uji Lanjut: Beban Banyak Pesanan & Batas Waktu Cut-Off (PRD 3.2 & 3.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // 1. PENGUJIAN BATAS WAKTU TEPAT DI DETIK-DETIK CUT-OFF (BOUNDARY TIME TESTING)
  // ---------------------------------------------------------------------------
  describe('Boundary Condition di Detik Menjelang Cut-Off', () => {
    it('14:59:59 WIB vs 15:00:00 WIB untuk Paket Utama (Batas 15:00 WIB)', () => {
      // 07:59:59 UTC = 14:59:59 WIB (1 detik sebelum cut-off)
      vi.setSystemTime(new Date('2026-09-24T07:59:59Z'));
      expect(getCurrentWIBHour()).toBe(14);
      expect(checkMainMealCutoff().isPastCutoff).toBe(false);

      // Tepat 08:00:00 UTC = 15:00:00 WIB (Cut-off tercapai)
      vi.setSystemTime(new Date('2026-09-24T08:00:00Z'));
      expect(getCurrentWIBHour()).toBe(15);
      expect(checkMainMealCutoff().isPastCutoff).toBe(true);

      // 08:00:01 UTC = 15:00:01 WIB (1 detik setelah cut-off)
      vi.setSystemTime(new Date('2026-09-24T08:00:01Z'));
      expect(getCurrentWIBHour()).toBe(15);
      expect(checkMainMealCutoff().isPastCutoff).toBe(true);
    });

    it('09:59:59 WIB vs 10:00:00 WIB untuk Paket Ekstra Siang (Batas 10:00 WIB)', () => {
      // 02:59:59 UTC = 09:59:59 WIB
      vi.setSystemTime(new Date('2026-09-24T02:59:59Z'));
      const hourBefore = getCurrentWIBHour();
      const isExtraSiangLockedBefore = hourBefore >= 10;
      expect(isExtraSiangLockedBefore).toBe(false);

      // 03:00:00 UTC = 10:00:00 WIB
      vi.setSystemTime(new Date('2026-09-24T03:00:00Z'));
      const hourAfter = getCurrentWIBHour();
      const isExtraSiangLockedAfter = hourAfter >= 10;
      expect(isExtraSiangLockedAfter).toBe(true);
    });

    it('13:59:59 WIB vs 14:00:00 WIB untuk Paket Ekstra Sore (Batas 14:00 WIB)', () => {
      // 06:59:59 UTC = 13:59:59 WIB
      vi.setSystemTime(new Date('2026-09-24T06:59:59Z'));
      const hourBefore = getCurrentWIBHour();
      const isExtraSoreLockedBefore = hourBefore >= 14;
      expect(isExtraSoreLockedBefore).toBe(false);

      // 07:00:00 UTC = 14:00:00 WIB
      vi.setSystemTime(new Date('2026-09-24T07:00:00Z'));
      const hourAfter = getCurrentWIBHour();
      const isExtraSoreLockedAfter = hourAfter >= 14;
      expect(isExtraSoreLockedAfter).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. SIMULASI VALIDASI KERANJANG CAMPURAN (MIXED CART) BERDASARKAN JAM
  // ---------------------------------------------------------------------------
  describe('Validasi Keranjang Campuran (Utama + Ekstra Siang + Ekstra Sore)', () => {
    // Helper fungsi menyerupai logika handleConfirm di Cart.jsx
    const validateCartCutoffs = (cartContent, currentHour) => {
      let invalidLock = null;
      const hasMainMeals = cartContent.hasMainMeals;
      const hasExtraSiang = cartContent.hasExtraSiang;
      const hasExtraSore = cartContent.hasExtraSore;

      if (hasMainMeals && currentHour >= 15) {
        invalidLock = 'Menu Utama (maks 15:00 WIB)';
      } else if (!invalidLock && hasExtraSiang && currentHour >= 10) {
        invalidLock = 'Ekstra Siang (maks 10:00 WIB)';
      } else if (!invalidLock && hasExtraSore && currentHour >= 14) {
        invalidLock = 'Ekstra Sore (maks 14:00 WIB)';
      }

      return {
        isValid: !invalidLock,
        rejectedReason: invalidLock,
      };
    };

    const mixedCart = {
      hasMainMeals: true,
      hasExtraSiang: true,
      hasExtraSore: true,
    };

    it('pada pukul 08:30 WIB: Seluruh isi keranjang lolos validasi', () => {
      vi.setSystemTime(new Date('2026-09-24T01:30:00Z')); // 08:30 WIB
      const hour = getCurrentWIBHour();
      const check = validateCartCutoffs(mixedCart, hour);

      expect(check.isValid).toBe(true);
      expect(check.rejectedReason).toBeNull();
    });

    it('pada pukul 10:15 WIB: Ditolak karena Ekstra Siang sudah melewati cut-off', () => {
      vi.setSystemTime(new Date('2026-09-24T03:15:00Z')); // 10:15 WIB
      const hour = getCurrentWIBHour();
      const check = validateCartCutoffs(mixedCart, hour);

      expect(check.isValid).toBe(false);
      expect(check.rejectedReason).toBe('Ekstra Siang (maks 10:00 WIB)');
    });

    it('pada pukul 14:05 WIB: Ditolak karena Ekstra Sore sudah melewati cut-off', () => {
      vi.setSystemTime(new Date('2026-09-24T07:05:00Z')); // 14:05 WIB
      const hour = getCurrentWIBHour();
      // Misal pasien menghapus ekstra siang, menyisakan Utama + Ekstra Sore
      const cartWithoutSiang = { hasMainMeals: true, hasExtraSiang: false, hasExtraSore: true };
      const check = validateCartCutoffs(cartWithoutSiang, hour);

      expect(check.isValid).toBe(false);
      expect(check.rejectedReason).toBe('Ekstra Sore (maks 14:00 WIB)');
    });

    it('pada pukul 15:02 WIB: Ditolak karena Paket Utama sudah melewati batas 15:00 WIB', () => {
      vi.setSystemTime(new Date('2026-09-24T08:02:00Z')); // 15:02 WIB
      const hour = getCurrentWIBHour();
      const onlyMainCart = { hasMainMeals: true, hasExtraSiang: false, hasExtraSore: false };
      const check = validateCartCutoffs(onlyMainCart, hour);

      expect(check.isValid).toBe(false);
      expect(check.rejectedReason).toBe('Menu Utama (maks 15:00 WIB)');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. STRESS TEST: BANYAK PESANAN SEKALIGUS (BULK ORDERS / BATCH PROCESSING)
  // ---------------------------------------------------------------------------
  describe('Beban Banyak Pesanan Sekaligus (Simulasi 50 Pasien & 150+ Menu)', () => {
    it('harus mengonsolidasikan 50 transaksi checkout tanpa data tertukar atau hilang', () => {
      const generatedRawOrders = [];
      const totalPatients = 50;
      const targetDate = new Date('2026-09-25T00:00:00Z');

      for (let i = 1; i <= totalPatients; i++) {
        const padId = String(i).padStart(3, '0');
        const orderCode = `ORD-20260924-${padId}`;
        const isVIP = i <= 20; // 20 pasien VIP, 30 pasien Kelas 1/2
        const hasAllergy = i % 5 === 0; // Pasien kelipatan 5 punya alergi

        // Pola Makan:
        // - Genap: Pesan lengkap (Pagi, Siang, Sore)
        // - Ganjil: Pesan parsial (Hanya Pagi & Sore)
        const mealsToOrder = i % 2 === 0 ? ['PAGI', 'SIANG', 'SORE'] : ['PAGI', 'SORE'];

        mealsToOrder.forEach((mealTime) => {
          // Paket Utama Pasien
          generatedRawOrders.push({
            orderCode,
            patientId: `pat-${padId}`,
            patient: {
              name: `Pasien Uji ${padId}`,
              rmNumber: `RM-${padId}`,
              allergies: hasAllergy ? 'Udang, Telur' : 'Tidak Ada',
            },
            roomNumber: `KAMAR-${padId}`,
            classType: isVIP ? 'VIP A' : 'Kelas 1',
            paketName: 'Paket A',
            mealTime,
            quantity: 1,
            type: 'INCLUDE',
            consumer: 'PASIEN',
            notes: hasAllergy ? 'Wadah tolong dipisah' : null,
            createdAt: new Date('2026-09-24T14:50:00Z'), // Dipesan jam 14:50 WIB
            servingDate: targetDate,
          });

          // Tambahan Ekstra untuk beberapa pasien
          if (mealTime === 'SORE' && i % 4 === 0) {
            generatedRawOrders.push({
              orderCode,
              patientId: `pat-${padId}`,
              patient: {
                name: `Pasien Uji ${padId}`,
                rmNumber: `RM-${padId}`,
                allergies: hasAllergy ? 'Udang, Telur' : 'Tidak Ada',
              },
              roomNumber: `KAMAR-${padId}`,
              classType: isVIP ? 'VIP A' : 'Kelas 1',
              paketName: 'Paket B Spesial',
              mealTime: 'SORE',
              quantity: 1,
              type: 'EXCLUDE',
              consumer: 'PENDAMPING',
              notes: hasAllergy ? 'Wadah tolong dipisah' : null,
              createdAt: new Date('2026-09-24T13:45:00Z'),
              servingDate: targetDate,
            });
          }
        });
      }

      // Pastikan data masukan memiliki ratusan baris mentah
      expect(generatedRawOrders.length).toBeGreaterThan(120);

      // Jalankan fungsi konsolidasi rekapitulasi dapur
      const startTime = performance.now();
      const groupedTable = groupOrdersForTable(generatedRawOrders);
      const executionTime = performance.now() - startTime;

      // 1. Kecepatan eksekusi harus di bawah 50ms untuk puluhan pasien
      expect(executionTime).toBeLessThan(50);

      // 2. Jumlah baris terkelompok tepat 50 (1 baris per orderCode transaksi)
      expect(groupedTable).toHaveLength(totalPatients);

      // 3. Verifikasi Konsistensi Data:
      // a. Pasien Genap (pesan lengkap) -> tidak ada kolom strip
      const sampleGenap = groupedTable.find((o) => o.orderCode === 'ORD-20260924-002');
      expect(sampleGenap.makanPagi).toBe('Paket A');
      expect(sampleGenap.makanSiang).toBe('Paket A');
      expect(sampleGenap.makanSore).toBe('Paket A');

      // b. Pasien Ganjil (pesan parsial) -> makan siang harus strip (-)
      const sampleGanjil = groupedTable.find((o) => o.orderCode === 'ORD-20260924-001');
      expect(sampleGanjil.makanPagi).toBe('Paket A');
      expect(sampleGanjil.makanSiang).toBe('-'); // Dilewati
      expect(sampleGanjil.makanSore).toBe('Paket A');

      // c. Pasien Alergi (kelipatan 5) -> hasAllergy = true
      const sampleAllergic = groupedTable.find((o) => o.orderCode === 'ORD-20260924-005');
      expect(sampleAllergic.hasAllergy).toBe(true);
      expect(sampleAllergic.allergyNote).toBe('Udang, Telur');

      // d. Pasien dengan Ekstra Sore (kelipatan 4) -> format pemisah '|'
      const sampleExtra = groupedTable.find((o) => o.orderCode === 'ORD-20260924-004');
      expect(sampleExtra.makanSore).toContain('|');
      expect(sampleExtra.makanSore).toBe('Paket A | Paket B Spesial');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. EDGE CASE CATATAN PESANAN: PANJANG MAKSIMAL, EMOJI, & KARAKTER KHUSUS
  // ---------------------------------------------------------------------------
  describe('Edge Case: Catatan Pesanan Pasien yang Kompleks', () => {
    it('harus menangani catatan panjang hingga batas 300 karakter dengan aman', () => {
      const longNote = 'Tolong disajikan hangat, kuah dipisah, porsi nasi sedikit saja. '.repeat(10);
      const result = validateNote(longNote);

      expect(result.valid).toBe(true);
      expect(result.sanitized.length).toBeLessThanOrEqual(300);
    });

    it('harus memvalidasi catatan yang mengandung karakter simbol umum (&, /, -)', () => {
      const dietNote = 'Diet Rendah Garam / DM - Tanpa MSG & Sayur Rebus';
      const result = validateNote(dietNote);

      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('Diet Rendah Garam');
      expect(result.sanitized).toContain('/');
      expect(result.sanitized).toContain('&');
    });
  });
});
