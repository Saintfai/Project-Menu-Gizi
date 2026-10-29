/**
 * Pengujian Unit: orderTransformer
 * Menguji transformasi baris pesanan mentah menjadi baris rekapitulasi tabel dapur gizi (PRD 3.8):
 * - Format pemisah waktu makan: garis miring (/) untuk porsi, garis tegak (|) untuk Paket Ekstra
 * - Tanda strip (-) untuk waktu makan yang tidak dipesan
 * - Deteksi riwayat alergi medis nyata (indikator titik merah 🔴)
 * - Pengelompokan pesanan flat berdasarkan transaksi pasien
 */

import { describe, it, expect } from 'vitest';
import { formatMealColumn, hasRealAllergy, groupOrdersForTable, isEmptyOrder } from '../orderTransformer';

describe('Transformasi & Format Rekapitulasi Dapur Gizi (PRD 3.8)', () => {
  // Uji formatting notasi string pada kolom waktu makan tabel rekap
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

    it('harus menampilkan nama Menu Ekstra langsung jika hanya memesan Paket Ekstra tanpa Paket Utama', () => {
      const items = [{ paketName: 'Paket C Spesial', quantity: 1, type: 'EXCLUDE' }];
      expect(formatMealColumn(items)).toBe('Paket C Spesial');
    });

    it('harus memprioritaskan nama menu aktual (menuName) daripada tulisan Paket A / Paket B', () => {
      const items = [{ menuName: 'Chicken Teriyaki', paketName: 'Paket A', quantity: 1, type: 'INCLUDE' }];
      expect(formatMealColumn(items)).toBe('Chicken Teriyaki');
    });

    it('harus memformat perkalian porsi (2x) menggunakan nama menu aktual', () => {
      const items = [{ menuName: 'Chicken Teriyaki', paketName: 'Paket A', quantity: 2, type: 'INCLUDE' }];
      expect(formatMealColumn(items)).toBe('Chicken Teriyaki 2x');
    });

    it('harus memisahkan beberapa hidangan menu aktual dengan garis miring (/)', () => {
      const items = [
        { menuName: 'Chicken Teriyaki', paketName: 'Paket A', quantity: 1, type: 'INCLUDE' },
        { menuName: 'Soto Bandung', paketName: 'Paket B', quantity: 1, type: 'INCLUDE' },
      ];
      expect(formatMealColumn(items)).toBe('Chicken Teriyaki / Soto Bandung');
    });

    it('harus memisahkan menu utama dan ekstra menggunakan nama menu aktual dengan garis tegak (|)', () => {
      const items = [
        { menuName: 'Chicken Teriyaki', paketName: 'Paket A', quantity: 2, type: 'INCLUDE' },
        { menuName: 'Soto Bandung', paketName: 'Paket B', quantity: 1, type: 'EXCLUDE' },
      ];
      expect(formatMealColumn(items)).toBe('Chicken Teriyaki 2x | Soto Bandung');
    });
  });

  // Uji pembedaan riwayat alergi nyata vs teks nihil ("Tidak Ada", "None", "-")
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

  // Uji pengelompokan baris pesanan ke baris tabel rekapitulasi dapur
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

    it('memisahkan pesanan Hari Ini (Ekstra) dan Besok (Utama) menjadi 2 baris terpisah', () => {
      const mixedOrder = [
        // Paket Utama Besok
        {
          orderCode: 'ORD-MIXED-001',
          patientId: 'p-100',
          patientName: 'Dewi Lestari',
          rmNumber: 'RM-9999',
          mealTime: 'PAGI',
          paketName: 'Paket A',
          type: 'INCLUDE',
          servingDate: '2026-10-23',
        },
        // Paket Ekstra Hari Ini
        {
          orderCode: 'ORD-MIXED-001',
          patientId: 'p-100',
          patientName: 'Dewi Lestari',
          rmNumber: 'RM-9999',
          mealTime: 'SIANG',
          menuName: 'Sop Iga Spesial',
          type: 'EXCLUDE',
          servingDate: '2026-10-22',
        },
      ];

      const res = groupOrdersForTable(mixedOrder);
      expect(res).toHaveLength(2);

      const todayRow = res.find((r) => r.servingDate === '2026-10-22' || String(r.servingDate).includes('2026-10-22'));
      const tomorrowRow = res.find((r) => r.servingDate === '2026-10-23' || String(r.servingDate).includes('2026-10-23'));

      expect(todayRow).toBeDefined();
      expect(todayRow.makanSiang).toContain('Sop Iga Spesial');
      expect(todayRow.makanPagi).toBe('-');

      expect(tomorrowRow).toBeDefined();
      expect(tomorrowRow.makanPagi).toBe('Paket A');
      expect(tomorrowRow.makanSiang).toBe('-');
    });

    it('menandai isEmptyOrder = true untuk pasien baru registrasi lewat cut-off tanpa menu', () => {
      const rawEmptyOrder = [
        {
          orderCode: 'ORD-146027',
          patientId: '146027',
          patientName: 'muncang',
          roomNumber: 'LILAC 5',
          classType: 'VIP A',
          servingDate: '2026-10-23',
          mealTime: null,
          menuName: null,
          quantity: 0,
        },
      ];

      const res = groupOrdersForTable(rawEmptyOrder);
      expect(res).toHaveLength(1);
      expect(res[0].patientId).toBe('146027');
      expect(res[0].isEmptyOrder).toBe(true);
      expect(res[0].makanPagi).toBe('-');
      expect(res[0].makanSiang).toBe('-');
      expect(res[0].makanSore).toBe('-');
    });

    it('menandai isEmptyOrder = true dan makanPagi = "-" jika item memiliki mealTime tetapi menuName dan paketName kosong (sync placeholder)', () => {
      const syncPlaceholderOrder = [
        {
          orderCode: 'ORD-48727-SYNC01',
          patientId: 48730,
          roomNumber: 'VIP C - 4.4',
          classType: 'VIP C',
          mealTime: 'PAGI',
          menuName: '',
          paketName: '',
          quantity: 1,
          servingDate: '2026-10-30',
        },
      ];

      const res = groupOrdersForTable(syncPlaceholderOrder);
      expect(res).toHaveLength(1);
      expect(res[0].makanPagi).toBe('-');
      expect(res[0].makanSiang).toBe('-');
      expect(res[0].makanSore).toBe('-');
      expect(res[0].isEmptyOrder).toBe(true);
    });
  });

  describe('isEmptyOrder() - Deteksi Pesanan Kosong Pasien Masuk Lewat Jam 15:00', () => {
    it('mengembalikan true jika semua waktu makan tidak memiliki item', () => {
      expect(isEmptyOrder({ itemsPagi: [], itemsSiang: [], itemsSore: [] })).toBe(true);
      expect(isEmptyOrder({ makanPagi: '-', makanSiang: '-', makanSore: '-' })).toBe(true);
      expect(isEmptyOrder(null)).toBe(true);
    });

    it('mengembalikan false jika setidaknya ada 1 item menu yang dipesan', () => {
      expect(isEmptyOrder({ itemsPagi: [{ name: 'Nasi Liwet' }], itemsSiang: [], itemsSore: [] })).toBe(false);
      expect(isEmptyOrder({ makanPagi: 'Paket A', makanSiang: '-', makanSore: '-' })).toBe(false);
    });
  });
});

