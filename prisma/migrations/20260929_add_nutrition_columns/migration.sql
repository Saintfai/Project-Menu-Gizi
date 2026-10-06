-- Migration: Add 5 nutrition columns to MenuItem table
-- Date: 2026-09-29
-- Description: Menambahkan kolom komponen gizi (karbohidrat, protein, nabati, proteinTambahan, sayur)
--              ke tabel MenuItem. Semua kolom nullable (opsional).

ALTER TABLE "MenuItem"
  ADD COLUMN IF NOT EXISTS "karbohidrat"     TEXT,
  ADD COLUMN IF NOT EXISTS "protein"         TEXT,
  ADD COLUMN IF NOT EXISTS "nabati"          TEXT,
  ADD COLUMN IF NOT EXISTS "proteinTambahan" TEXT,
  ADD COLUMN IF NOT EXISTS "sayur"           TEXT;
