import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS karbohidrat TEXT');
  console.log('+ karbohidrat');
  await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS protein TEXT');
  console.log('+ protein');
  await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS nabati TEXT');
  console.log('+ nabati');
  await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS "proteinTambahan" TEXT');
  console.log('+ proteinTambahan');
  await pool.query('ALTER TABLE "MenuItem" ADD COLUMN IF NOT EXISTS sayur TEXT');
  console.log('+ sayur');
  console.log('✅ Semua kolom gizi berhasil ditambahkan ke Supabase!');
} catch(e) {
  console.error('❌ Error:', e.message);
} finally {
  await pool.end();
}
