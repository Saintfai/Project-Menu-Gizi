/**
 * NAMA FILE: orderService.js
 * FUNGSI UTAMA: Modul Service untuk menangani logika bisnis dan integrasi API (Backend).
 * 
 * DETAIL:
 * - Berinteraksi dengan database atau layanan eksternal (Supabase).
 * - Menjalankan operasi CRUD (Create, Read, Update, Delete) terkait domain spesifik.
 */
import { supabase } from '../utils/supabase';
import { sanitizeText } from '../utils/inputValidator';


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


export async function createOrders(orderItems) {
  
  const sanitizedItems = orderItems.map(item => ({
    ...item,
    notes: item.notes ? sanitizeText(item.notes, 300) : null,
    menuName: item.menuName ? sanitizeText(item.menuName, 100) : item.menuName,
  }));

  const { data, error } = await supabase
    .from('Order')
    .insert(sanitizedItems)
    .select();

  if (error) {
    console.error('Error creating orders in Supabase:', error);
    throw error;
  }

  return data;
}

