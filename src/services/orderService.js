import { supabase } from '../utils/supabase';
import { sanitizeText } from '../utils/inputValidator';


/**
 * Mengambil daftar pesanan dari database Supabase dengan berbagai opsi filter.
 * Digunakan oleh Dashboard Dapur Gizi untuk memantau pesanan masuk secara real-time.
 * 
 * @param {object} [options={}] - Opsi filter kueri pesanan
 * @param {string} [options.servingDate] - Filter tanggal penyajian T+1 (ISO String)
 * @param {string} [options.startDate] - Filter tanggal awal rentang penyajian
 * @param {string} [options.endDate] - Filter tanggal akhir rentang penyajian
 * @param {string} [options.orderCode] - Filter kode transaksi pesanan
 * @param {string} [options.patientId] - Filter ID pasien
 * @param {'INCLUDE' | 'EXCLUDE'} [options.type] - Filter tipe pesanan (Utama vs Ekstra)
 * @returns {Promise<Array<object>>} Daftar pesanan beserta relasi data pasien
 */
export async function getOrders(options = {}) {
  let query = supabase
    .from('Order')
    .select(`
      *,
      patient:Patient (
        id,
        rmNumber,
        name,
        roomName,
        roomClass,
        allergies
      )
    `)
    .order('createdAt', { ascending: false });

  if (options.servingDate) {
    query = query.eq('servingDate', options.servingDate);
  }

  if (options.startDate) {
    query = query.gte('servingDate', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('servingDate', options.endDate);
  }

  if (options.orderCode) {
    query = query.eq('orderCode', options.orderCode);
  }

  if (options.patientId) {
    query = query.eq('patientId', options.patientId);
  }

  if (options.type) {
    query = query.eq('type', options.type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders from Supabase:', error);
    throw error;
  }

  return data || [];
}


/**
 * Mengirimkan data checkout pesanan ke Supabase Edge Function 'create-order'.
 * Memvalidasi batas waktu cut-off, kuota porsi kamar, dan pencegahan duplikat secara aman di server.
 * 
 * @param {Array<object> | object} orderItems - Item pesanan atau payload checkout pasien
 * @returns {Promise<Array<object>>} Daftar data baris pesanan yang berhasil disimpan
 * @throws {Error} Pesan kesalahan jika cut-off terlewat, kuota terlampaui, atau terjadi duplicate order
 */
export async function createOrders(orderItems) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(orderItems),
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Gagal menyimpan pesanan.');
  }

  return result.orders || result;
}

