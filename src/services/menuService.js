/**
 * NAMA FILE: menuService.js
 * FUNGSI UTAMA: Modul Service untuk menangani logika bisnis dan integrasi API (Backend).
 * 
 * DETAIL:
 * - Berinteraksi dengan database atau layanan eksternal (Supabase).
 * - Menjalankan operasi CRUD (Create, Read, Update, Delete) terkait domain spesifik.
 */
import { supabase } from '../utils/supabase';


export async function getMenuCycles() {
  const { data, error } = await supabase
    .from('MenuCycle')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching menu cycles:', error);
    throw error;
  }

  return data || [];
}


export async function getMenuItemsByCycle(cycleId) {
  const { data, error } = await supabase
    .from('MenuItem')
    .select('*')
    .eq('cycleId', cycleId)
    .order('mealTime', { ascending: true })
    .order('paketName', { ascending: true });

  if (error) {
    console.error(`Error fetching menu items for cycle ${cycleId}:`, error);
    throw error;
  }

  return data || [];
}


export async function updateMenuItem(id, updates) {
  const { data, error } = await supabase
    .from('MenuItem')
    .update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating menu item ${id}:`, error);
    throw error;
  }

  return data;
}


export async function createMenuItem(newItem) {
  const { data, error } = await supabase
    .from('MenuItem')
    .insert([
      {
        ...newItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }

  return data;
}


export async function deleteMenuItem(id) {
  const { error } = await supabase
    .from('MenuItem')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting menu item ${id}:`, error);
    throw error;
  }

  return true;
}
