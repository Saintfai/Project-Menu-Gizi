/**
 * NAMA FILE: supabase.js
 * FUNGSI UTAMA: Fungsi-fungsi utilitas pendukung (Helper Functions).
 * 
 * DETAIL:
 * - Berisi fungsi murni (pure functions) untuk pemformatan, validasi, atau komputasi umum.
 * - Dapat dipanggil dari berbagai bagian aplikasi untuk menghindari duplikasi kode.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
