import { describe, it, expect } from 'vitest';
import { formatMealColumn, hasRealAllergy, groupOrdersForTable } from '../orderTransformer';

describe('Transformasi & Format Rekapitulasi Dapur Gizi (PRD 3.8)', () => {
  describe('formatMealColumn() - Notasi Pemisah Kolom Makan', () => {
    it('harus menghasilkan tanda strip (-) jika pasien tidak memesan pada waktu makan tersebut', () => {
      expect(formatMealColumn([])).toBe('-');
      expect(formatMealColumn(null)).toBe('-');
      expect(formatMealColumn(undefined)).toBe('-');
    });

    it('harus memformat 1 porsi menu Paket Utama dengan benar', () => {
      const items = [{ paketName: 'Paket A', quantity: 1, type: 'INCLUDE' }];
      expect(formatMealColumn(items)).toBe('Paket A');
    });

    it('harus menambahkan penanda perkalian (2x) jika memesan 2 porsi menu yang sama', () => {
      const items = [{ paketName: 'Paket A', quantity: 2, type: 'INCLUDE' }];
      expect(formatMealColumn(items)).toBe('Paket A 2x');
    });

    it('harus memisahkan porsi pasien dan pendamping dengan garis miring (/)', () => {
      const items = [
        { paketName: 'Paket A', quantity: 1, type: 'INCLUDE' },
        { paketName: 'Paket B', quantity: 1, type: 'INCLUDE' },
      ];
      expect(formatMealColumn(items)).toBe('Paket A / Paket B');
    });

    it('harus memisahkan Paket Utama (Include) dan Paket Ekstra (Exclude) dengan garis tegak (|)', () => {
      const items = [
        { paketName: 'Paket A', quantity: 2, type: 'INCLUDE' },
        { paketName: 'Paket B', quantity: 1, type: 'EXCLUDE' },
      ];
      expect(formatMealColumn(items)).toBe('Paket A 2x | Paket B');
    });

    it('harus menampilkan (- | Menu Ekstra) jika hanya memesan Paket Ekstra tanpa Paket Utama', () => {
      const items = [{ paketName: 'Paket C Spesial', quantity: 1, type: 'EXCLUDE' }];
      expect(formatMealColumn(items)).toBe('- | Paket C Spesial');
    });
  });

  describe('hasRealAllergy() - Deteksi Riwayat Alergi Nyata', () => {
    it('harus bernilai true untuk alergi medis spesifik', () => {
      expect(hasRealAllergy('Seafood, Kacang')).toBe(true);
      expect(hasRealAllergy('Udang')).toBe(true);
      expect(hasRealAllergy('Telur, Susu Sapi')).toBe(true);
      expect(hasRealAllergy('Antibiotik Penicilin')).toBe(true);
    });

    it('harus bernilai false jika alergi kosong, nihil, atau tidak ada', () => {
      expect(hasRealAllergy('Tidak Ada')).toBe(false);
      expect(hasRealAllergy('tidak ada')).toBe(false);
      expect(hasRealAllergy('Tidak')).toBe(false);
      expect(hasRealAllergy('None')).toBe(false);
      expect(hasRealAllergy('nihil')).toBe(false);
      expect(hasRealAllergy('-')).toBe(false);
      expect(hasRealAllergy('--')).toBe(false);
      expect(hasRealAllergy('n/a')).toBe(false);
      expect(hasRealAllergy('tidak ada riwayat alergi')).toBe(false);
      expect(hasRealAllergy('')).toBe(false);
      expect(hasRealAllergy(null)).toBe(false);
      expect(hasRealAllergy(undefined)).toBe(false);
    });
  });

  describe('groupOrdersForTable() - Konsolidasi Flat Order Records', () => {
    it('harus mengembalikan array kosong jika tidak ada order', () => {
      expect(groupOrdersForTable([])).toEqual([]);
      expect(groupOrdersForTable(null)).toEqual([]);
    });

    it('harus mengelompokkan pesanan parsial dan menandai alergi dengan benar', () => {
      const mockRawOrders = [
        // Pasien 1 (Andi): Hanya pesan Sarapan (Pagi) Paket A 1x
        {
          orderCode: 'ORD-20260925-001',
          patientId: 'p-1',
          patient: {
            name: 'Andi Pratama',
            rmNumber: 'RM-12345',
            allergies: 'Tidak Ada',
          },
          roomNumber: 'LAVENDER 1 - 1.1',
          classType: 'VIP A',
          paketName: 'Paket A',
          mealTime: 'PAGI',
          quantity: 1,
          type: 'INCLUDE',
          notes: 'Minta disajikan hangat',
          createdAt: new Date('2026-09-24T08:00:00Z'),
          servingDate: new Date('2026-09-25T00:00:00Z'),
        },
        // Pasien 2 (Budi): Pesan Siang (Paket B) + Ekstra Siang (Paket C), dan Sore (Paket A)
        {
          orderCode: 'ORD-20260925-002',
          patientId: 'p-2',
          patient: {
            name: 'Budi Santoso',
            rmNumber: 'RM-11111',
            allergies: 'Seafood, Kacang',
          },
          roomNumber: 'LILY 2 - 2.1',
          classType: 'VIP C',
          paketName: 'Paket B',
          mealTime: 'SIANG',
          quantity: 1,
          type: 'INCLUDE',
          notes: 'Wadah jangan tercampur',
          createdAt: new Date('2026-09-24T08:00:00Z'),
          servingDate: new Date('2026-09-25T00:00:00Z'),
        },
        {
          orderCode: 'ORD-20260925-002',
          patientId: 'p-2',
          patient: {
            name: 'Budi Santoso',
            rmNumber: 'RM-11111',
            allergies: 'Seafood, Kacang',
          },
          roomNumber: 'LILY 2 - 2.1',
          classType: 'VIP C',
          paketName: 'Paket C',
          mealTime: 'SIANG',
          quantity: 1,
          type: 'EXCLUDE',
          notes: 'Wadah jangan tercampur',
          createdAt: new Date('2026-09-24T08:00:00Z'),
          servingDate: new Date('2026-09-25T00:00:00Z'),
        },
      ];

      const grouped = groupOrdersForTable(mockRawOrders);

      expect(grouped).toHaveLength(2);

      // Verifikasi Pasien 1 (Pesanan Parsial: Pagi ada, Siang & Sore strip)
      const andiOrder = grouped.find((o) => o.orderCode === 'ORD-20260925-001');
      expect(andiOrder).toBeDefined();
      expect(andiOrder.makanPagi).toBe('Paket A');
      expect(andiOrder.makanSiang).toBe('-'); // Tidak dipesan
      expect(andiOrder.makanSore).toBe('-'); // Tidak dipesan
      expect(andiOrder.hasAllergy).toBe(false); // Tanpa alergi
      expect(andiOrder.catatan).toBe('Minta disajikan hangat');

      // Verifikasi Pasien 2 (Alergi aktif & kombinasi Include + Exclude)
      const budiOrder = grouped.find((o) => o.orderCode === 'ORD-20260925-002');
      expect(budiOrder).toBeDefined();
      expect(budiOrder.makanPagi).toBe('-'); // Tidak pesan pagi
      expect(budiOrder.makanSiang).toBe('Paket B | Paket C'); // Kombinasi Include & Exclude
      expect(budiOrder.hasAllergy).toBe(true); // Memiliki indikator 🔴
      expect(budiOrder.allergyNote).toBe('Seafood, Kacang');
    });
  });
});
