-- ============================================================
-- Supabase Row-Level Security (RLS) Policies (HARDENED)
-- Hospital Dietary System — Project Menu Gizi
--
-- Run this script via Supabase SQL Editor (Dashboard > SQL Editor)
-- to apply hardened RLS policies across all tables.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ENABLE RLS ON ALL TABLES
-- ────────────────────────────────────────────────────────────

ALTER TABLE "MenuCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"     ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 2. DROP EXISTING POLICIES (Idempotent - safe to re-run)
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "MenuCycle: public read"        ON "MenuCycle";
DROP POLICY IF EXISTS "MenuItem: public read"         ON "MenuItem";
DROP POLICY IF EXISTS "MenuItem: service_role write"  ON "MenuItem";
DROP POLICY IF EXISTS "Patient: anon read"            ON "Patient";
DROP POLICY IF EXISTS "Patient: service_role only"    ON "Patient";
DROP POLICY IF EXISTS "Order: anon insert"            ON "Order";
DROP POLICY IF EXISTS "Order: public read"            ON "Order";
DROP POLICY IF EXISTS "Order: service_role write"     ON "Order";

-- ────────────────────────────────────────────────────────────
-- 3. CREATE HARDENED POLICIES
-- ────────────────────────────────────────────────────────────

-- MenuCycle: Anyone can read menu cycles (public catalog)
CREATE POLICY "MenuCycle: public read"
  ON "MenuCycle" FOR SELECT
  USING (true);

-- MenuItem: Anyone can read menu items (public catalog)
CREATE POLICY "MenuItem: public read"
  ON "MenuItem" FOR SELECT
  USING (true);

-- MenuItem: Only service_role can create/update/delete menu items
CREATE POLICY "MenuItem: service_role write"
  ON "MenuItem" FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Patient: RESTRICTED TO SERVICE_ROLE ONLY
-- Anonymous / client-side queries CANNOT read patient records.
-- All patient lookups must go through Edge Function 'patient-lookup'.
-- Note: In Supabase, service_role bypasses RLS automatically.
-- By having NO policy for anon/authenticated, all direct client queries return empty/blocked.
CREATE POLICY "Patient: service_role only"
  ON "Patient" FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Order: RESTRICTED INSERT
-- Anonymous users CANNOT insert orders directly from the browser.
-- All order creations MUST go through Edge Function 'create-order' (which validates
-- cut-off times, duplicate check, and portion quotas before inserting with service_role).
CREATE POLICY "Order: service_role write"
  ON "Order" FOR INSERT
  WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Order: Read access for Dashboard Realtime
-- Dashboard Admin uses anon key with Supabase realtime subscription to display incoming orders.
CREATE POLICY "Order: public read"
  ON "Order" FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 4. VERIFIKASI KEAMANAN
-- ────────────────────────────────────────────────────────────
-- Setelah mengeksekusi script ini di Supabase SQL Editor:
--   ✓ Tabel Patient: TIDAK BISA dibaca langsung lewat browser anon key (Protected PII).
--   ✓ Tabel Order: TIDAK BISA di-insert sembarangan lewat browser console.
--   ✓ Edge Functions: Memiliki akses penuh via SUPABASE_SERVICE_ROLE_KEY.
--   ✓ Dashboard Realtime: Tetap berfungsi memantau pesanan masuk secara live.
