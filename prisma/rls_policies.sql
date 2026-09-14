-- ============================================================
-- Supabase Row-Level Security (RLS) Policies
-- Hospital Dietary System — Project Menu Gizi
--
-- Run this script ONCE via Supabase SQL Editor (Dashboard > SQL)
-- to enable and configure RLS on all tables.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ENABLE RLS ON ALL TABLES
-- ────────────────────────────────────────────────────────────

ALTER TABLE "MenuCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"     ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 2. DROP EXISTING POLICIES (idempotent — safe to re-run)
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "MenuCycle: public read"        ON "MenuCycle";
DROP POLICY IF EXISTS "MenuItem: public read"         ON "MenuItem";
DROP POLICY IF EXISTS "MenuItem: service_role write"  ON "MenuItem";
DROP POLICY IF EXISTS "Patient: anon read"            ON "Patient";
DROP POLICY IF EXISTS "Order: anon insert"            ON "Order";
DROP POLICY IF EXISTS "Order: public read"            ON "Order";

-- ────────────────────────────────────────────────────────────
-- 3. CREATE POLICIES
-- ────────────────────────────────────────────────────────────

-- MenuCycle: Anyone can read menu cycles (public data)
CREATE POLICY "MenuCycle: public read"
  ON "MenuCycle" FOR SELECT
  USING (true);

-- MenuItem: Anyone can read menu items (public data)
CREATE POLICY "MenuItem: public read"
  ON "MenuItem" FOR SELECT
  USING (true);

-- MenuItem: Only service_role can create/update/delete menu items
-- (admin operations should go through Edge Functions using service_role key)
CREATE POLICY "MenuItem: service_role write"
  ON "MenuItem" FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Patient: Can be read by anyone (needed for login/lookup flow)
-- Note: Column filtering is handled by the frontend query (select specific columns)
CREATE POLICY "Patient: anon read"
  ON "Patient" FOR SELECT
  USING (true);

-- Order: Anyone can insert new orders (patients placing meal orders)
CREATE POLICY "Order: anon insert"
  ON "Order" FOR INSERT
  WITH CHECK (true);

-- Order: Anyone can read orders (dashboard uses anon key for real-time)
-- Note: Ideally, read should be restricted to admin-only via Edge Function in the future
CREATE POLICY "Order: public read"
  ON "Order" FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 4. VERIFY
-- ────────────────────────────────────────────────────────────
-- After running, verify in Supabase Dashboard > Authentication > Policies
-- that all 6 policies are listed and RLS is enabled (green toggle) on each table.
--
-- IMPORTANT: With RLS enabled, anonymous users can NO LONGER:
--   ✗ DELETE any rows from any table
--   ✗ UPDATE any rows (except via service_role)
--   ✗ INSERT into Patient, MenuCycle, or MenuItem tables
--
-- They CAN still:
--   ✓ SELECT from all tables (needed for app functionality)
--   ✓ INSERT into Order table (needed for placing orders)
