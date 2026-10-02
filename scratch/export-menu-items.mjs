/**
 * Script: Export Menu Items dari Supabase
 * 
 * Cara pakai:
 *   node scratch/export-menu-items.js
 * 
 * Output:
 *   - scratch/menu_items_export.json  → Data lengkap (untuk referensi API)
 *   - scratch/menu_items_export.csv   → Bisa dibuka di Excel
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load .env dari root project
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportMenuItems() {
  console.log('📦 Mengambil data MenuItem...');
  const { data: menuItems, error: menuError } = await supabase
    .from('MenuItem')
    .select('*')
    .order('cycleId', { ascending: true })
    .order('mealTime', { ascending: true })
    .order('paketName', { ascending: true });

  if (menuError) {
    console.error('❌ Gagal mengambil MenuItem:', menuError.message);
    process.exit(1);
  }

  console.log(`✅ ${menuItems.length} menu item ditemukan.`);

  const items = menuItems.map(item => ({
    id: item.id,
    cycleId: item.cycleId,
    mealTime: item.mealTime,
    paketName: item.paketName || '-',
    name: item.name,
    description: item.description || '-',
    karbohidrat: item.karbohidrat || '-',
    protein: item.protein || '-',
    nabati: item.nabati || '-',
    proteinTambahan: item.proteinTambahan || '-',
    sayur: item.sayur || '-',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  // --- Export JSON ---
  const jsonPath = join(__dirname, 'menu_items_export.json');
  const jsonOutput = {
    exportedAt: new Date().toISOString(),
    totalMenuItems: menuItems.length,
    menuItems: items,
  };
  writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
  console.log(`📄 JSON disimpan → ${jsonPath}`);

  // --- Export CSV ---
  const csvPath = join(__dirname, 'menu_items_export.csv');
  const csvHeader = 'id,cycleId,mealTime,paketName,name,description,karbohidrat,protein,nabati,proteinTambahan,sayur,createdAt,updatedAt';
  const csvRows = items.map(item => {
    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
    return [
      escape(item.id),
      item.cycleId,
      escape(item.mealTime),
      escape(item.paketName),
      escape(item.name),
      escape(item.description),
      escape(item.karbohidrat),
      escape(item.protein),
      escape(item.nabati),
      escape(item.proteinTambahan),
      escape(item.sayur),
      escape(item.createdAt),
      escape(item.updatedAt),
    ].join(',');
  });
  writeFileSync(csvPath, [csvHeader, ...csvRows].join('\n'), 'utf-8');
  console.log(`📊 CSV disimpan → ${csvPath}`);

  console.log('\n✅ Selesai! File siap dikirim ke atasan.');
}

exportMenuItems().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
