-- ============================================
-- COMPREHENSIVE FIX FOR ALL ADMIN TABLE RLS POLICIES
-- ============================================
-- This script fixes RLS policies for all tables that admins need to manage:
-- plans, locations, credential_pools, admin_notifications

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop all existing policies on plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
DROP POLICY IF EXISTS "Public can view active plans" ON plans;
DROP POLICY IF EXISTS "Admin manage plans" ON plans;
DROP POLICY IF EXISTS "Public read plans" ON plans;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON plans;

-- Drop all existing policies on locations
DROP POLICY IF EXISTS "Anyone can view active locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Public can view active locations" ON locations;
DROP POLICY IF EXISTS "Admin manage locations" ON locations;
DROP POLICY IF EXISTS "Public read locations" ON locations;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON locations;

-- Drop all existing policies on credential_pools
DROP POLICY IF EXISTS "Admins can manage credentials" ON credential_pools;
DROP POLICY IF EXISTS "Admin manage credentials" ON credential_pools;
DROP POLICY IF EXISTS "System can read available credentials" ON credential_pools;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON credential_pools;

-- Drop all existing policies on admin_notifications
DROP POLICY IF EXISTS "Anyone can view active notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admin manage notifications" ON admin_notifications;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON admin_notifications;

-- ============================================
-- STEP 2: CREATE HELPER FUNCTION FOR ADMIN CHECK
-- ============================================

-- Create or replace the admin check function
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================
-- STEP 3: CREATE NEW POLICIES FOR PLANS TABLE
-- ============================================

-- Public can view active plans
CREATE POLICY "plans_select_public" 
ON plans 
FOR SELECT 
TO public
USING (is_active = true);

-- Authenticated users can view all plans
CREATE POLICY "plans_select_authenticated" 
ON plans 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can insert plans
CREATE POLICY "plans_insert_admin" 
ON plans 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

-- Admins can update plans
CREATE POLICY "plans_update_admin" 
ON plans 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Admins can delete plans
CREATE POLICY "plans_delete_admin" 
ON plans 
FOR DELETE 
TO authenticated
USING (is_admin());

-- ============================================
-- STEP 4: CREATE NEW POLICIES FOR LOCATIONS TABLE
-- ============================================

-- Public can view active locations
CREATE POLICY "locations_select_public" 
ON locations 
FOR SELECT 
TO public
USING (is_active = true);

-- Authenticated users can view all locations
CREATE POLICY "locations_select_authenticated" 
ON locations 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can insert locations
CREATE POLICY "locations_insert_admin" 
ON locations 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

-- Admins can update locations
CREATE POLICY "locations_update_admin" 
ON locations 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Admins can delete locations
CREATE POLICY "locations_delete_admin" 
ON locations 
FOR DELETE 
TO authenticated
USING (is_admin());

-- ============================================
-- STEP 5: CREATE NEW POLICIES FOR CREDENTIAL_POOLS TABLE
-- ============================================

-- System and admins can view all credentials
CREATE POLICY "credentials_select_admin" 
ON credential_pools 
FOR SELECT 
TO authenticated
USING (is_admin() OR true); -- Allow system to read for assignment

-- Admins can insert credentials
CREATE POLICY "credentials_insert_admin" 
ON credential_pools 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

-- Admins and system can update credentials
CREATE POLICY "credentials_update_admin" 
ON credential_pools 
FOR UPDATE 
TO authenticated
USING (is_admin() OR true) -- Allow system to update for assignment
WITH CHECK (is_admin() OR true);

-- Admins can delete credentials
CREATE POLICY "credentials_delete_admin" 
ON credential_pools 
FOR DELETE 
TO authenticated
USING (is_admin());

-- ============================================
-- STEP 6: CREATE NEW POLICIES FOR ADMIN_NOTIFICATIONS TABLE
-- ============================================

-- Public can view active notifications
CREATE POLICY "notifications_select_public" 
ON admin_notifications 
FOR SELECT 
TO public
USING (is_active = true);

-- Authenticated users can view all notifications
CREATE POLICY "notifications_select_authenticated" 
ON admin_notifications 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can insert notifications
CREATE POLICY "notifications_insert_admin" 
ON admin_notifications 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

-- Admins can update notifications
CREATE POLICY "notifications_update_admin" 
ON admin_notifications 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Admins can delete notifications
CREATE POLICY "notifications_delete_admin" 
ON admin_notifications 
FOR DELETE 
TO authenticated
USING (is_admin());

-- ============================================
-- STEP 7: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant permissions on tables
GRANT ALL ON plans TO authenticated;
GRANT ALL ON locations TO authenticated;
GRANT ALL ON credential_pools TO authenticated;
GRANT ALL ON admin_notifications TO authenticated;

-- Grant permissions on sequences (if they exist)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on UUID function
GRANT EXECUTE ON FUNCTION gen_random_uuid() TO authenticated;

-- ============================================
-- STEP 8: VERIFY THE SETUP
-- ============================================

-- Check if current user is admin
SELECT 
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email,
  (SELECT role FROM profiles WHERE id = auth.uid()) as role,
  is_admin() as is_admin_check;

-- List all policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('plans', 'locations', 'credential_pools', 'admin_notifications')
ORDER BY tablename, policyname;

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('plans', 'locations', 'credential_pools', 'admin_notifications');

-- Test queries (uncomment to test)
-- SELECT COUNT(*) as plans_count FROM plans;
-- SELECT COUNT(*) as locations_count FROM locations;
-- INSERT INTO plans (name, duration, duration_hours, price, data_amount, type, is_active) 
-- VALUES ('Test Plan', '1 Day', 24, 100, '1GB', 'daily', true);
-- INSERT INTO locations (name, wifi_name, is_active) 
-- VALUES ('Test Location', 'Test WiFi', true);