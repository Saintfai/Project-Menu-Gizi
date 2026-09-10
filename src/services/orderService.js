import { supabase } from '../utils/supabase';

/**
 * Mengambil semua pesanan dari database Supabase (tabel Order dengan relasi Patient).
 * @param {object} options - Opsi filter seperti { servingDate, orderCode }
 * @returns {Promise<Array>}
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
 * Menyimpan transaksi pesanan baru ke tabel Order
 * @param {Array<object>} orderItems - Array item pesanan yang akan diinsert
 */
export async function createOrders(orderItems) {
  const { data, error } = await supabase
    .from('Order')
    .insert(orderItems)
    .select();

  if (error) {
    console.error('Error creating orders in Supabase:', error);
    throw error;
  }

  return data;
}
