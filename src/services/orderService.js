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

