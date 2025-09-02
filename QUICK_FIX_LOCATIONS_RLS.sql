-- ============================================
-- QUICK FIX FOR LOCATIONS TABLE RLS
-- ============================================
-- Run this in Supabase SQL Editor as a quick fix

-- Step 1: Temporarily disable RLS to fix the immediate issue
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Step 2: Re-enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view active locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Public can view active locations" ON locations;
DROP POLICY IF EXISTS "Admin manage locations" ON locations;
DROP POLICY IF EXISTS "Public read locations" ON locations;
DROP POLICY IF EXISTS "public_read_active_locations" ON locations;
DROP POLICY IF EXISTS "authenticated_read_all_locations" ON locations;
DROP POLICY IF EXISTS "admin_insert_locations" ON locations;
DROP POLICY IF EXISTS "admin_update_locations" ON locations;
DROP POLICY IF EXISTS "admin_delete_locations" ON locations;

-- Step 4: Create a simple, permissive policy for authenticated users
-- This allows all authenticated users to do everything (temporary fix)
CREATE POLICY "authenticated_users_full_access" 
ON locations 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Verify
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'locations';

-- Step 6: Test insert (this should work now)
-- INSERT INTO locations (name, wifi_name, is_active) 
-- VALUES ('Test Location', 'Test WiFi', true);

-- ============================================
-- PROPER FIX (Run after confirming the above works)
-- ============================================
/*
-- Once the immediate issue is resolved, implement proper policies:

-- Drop the temporary permissive policy
DROP POLICY IF EXISTS "authenticated_users_full_access" ON locations;

-- Create proper policies
CREATE POLICY "public_view_active_locations" 
ON locations 
FOR SELECT 
TO public
USING (is_active = true);

CREATE POLICY "admin_manage_locations" 
ON locations 
FOR ALL 
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
*/