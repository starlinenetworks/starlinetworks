-- ============================================
-- FIX LOCATIONS TABLE RLS POLICIES
-- ============================================
-- This script fixes the RLS policies for the locations table
-- to allow admins to properly manage locations

-- First, check current policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'locations'
ORDER BY policyname;

-- Drop existing policies on locations table
DROP POLICY IF EXISTS "Anyone can view active locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Public can view active locations" ON locations;
DROP POLICY IF EXISTS "Admin manage locations" ON locations;
DROP POLICY IF EXISTS "Public read locations" ON locations;

-- Recreate policies with proper permissions

-- 1. Public SELECT policy - anyone can view active locations
CREATE POLICY "public_read_active_locations" 
ON locations 
FOR SELECT 
TO public
USING (is_active = true);

-- 2. Authenticated users can also view all locations
CREATE POLICY "authenticated_read_all_locations" 
ON locations 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Admin INSERT policy
CREATE POLICY "admin_insert_locations" 
ON locations 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Admin UPDATE policy
CREATE POLICY "admin_update_locations" 
ON locations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 5. Admin DELETE policy
CREATE POLICY "admin_delete_locations" 
ON locations 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Verify the new policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'locations'
ORDER BY policyname;

-- Test admin access (replace with your admin user ID)
-- This should return true if you're an admin
SELECT 
  auth.uid() as current_user_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role,
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) as is_admin;

-- Grant necessary permissions to authenticated users
GRANT ALL ON locations TO authenticated;
GRANT USAGE ON SEQUENCE locations_id_seq TO authenticated;

-- If locations table uses UUID, ensure proper permissions
GRANT EXECUTE ON FUNCTION gen_random_uuid() TO authenticated;

-- Alternative approach if the above doesn't work:
-- Create a simpler admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then use this function in policies (uncomment if needed)
/*
DROP POLICY IF EXISTS "admin_insert_locations" ON locations;
DROP POLICY IF EXISTS "admin_update_locations" ON locations;
DROP POLICY IF EXISTS "admin_delete_locations" ON locations;

CREATE POLICY "admin_insert_locations_v2" 
ON locations 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "admin_update_locations_v2" 
ON locations 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "admin_delete_locations_v2" 
ON locations 
FOR DELETE 
TO authenticated
USING (is_admin());
*/

-- Final verification
SELECT 
  'Locations table RLS status:' as info,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'locations') as policy_count,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'locations' AND schemaname = 'public') as rls_enabled;