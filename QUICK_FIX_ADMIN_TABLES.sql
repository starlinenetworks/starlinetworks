-- ============================================
-- QUICK FIX FOR ADMIN TABLES (PLANS & LOCATIONS)
-- ============================================
-- Run this immediately in Supabase SQL Editor to fix the issue

-- STEP 1: Drop all existing problematic policies
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
DROP POLICY IF EXISTS "Public can view active plans" ON plans;
DROP POLICY IF EXISTS "Admin manage plans" ON plans;

DROP POLICY IF EXISTS "Anyone can view active locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Public can view active locations" ON locations;
DROP POLICY IF EXISTS "Admin manage locations" ON locations;

-- STEP 2: Create temporary permissive policies for authenticated users
-- This allows all authenticated users to manage these tables temporarily

CREATE POLICY "temp_authenticated_full_access" 
ON plans 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "temp_authenticated_full_access" 
ON locations 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 3: Also fix credential_pools if needed
DROP POLICY IF EXISTS "Admins can manage credentials" ON credential_pools;
DROP POLICY IF EXISTS "Admin manage credentials" ON credential_pools;

CREATE POLICY "temp_authenticated_full_access" 
ON credential_pools 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 4: Verify the fix
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('plans', 'locations', 'credential_pools')
ORDER BY tablename;

-- Now you should be able to add plans and locations!
-- After confirming it works, run the comprehensive fix (FIX_ALL_ADMIN_RLS.sql)