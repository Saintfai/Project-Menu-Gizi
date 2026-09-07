import { supabase } from '../utils/supabase';

/**
 * Mengambil daftar semua siklus menu (1 s.d. 11)
 */
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

/**
 * Mengambil semua menu item untuk siklus tertentu
 * @param {number} cycleId
 */
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

/**
 * Memperbarui data menu item
 * @param {string} id
 * @param {object} updates - { name, description, paketName, mealTime }
 */
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

/**
 * Menambahkan item menu baru ke dalam siklus
 * @param {object} newItem - { cycleId, mealTime, paketName, name, description }
 */
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

/**
 * Menghapus item menu berdasarkan ID
 * @param {string} id
 */
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
