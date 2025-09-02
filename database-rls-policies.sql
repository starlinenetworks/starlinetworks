-- ============================================
-- StarNetX RLS Policies
-- Run this AFTER running database-schema.sql
-- ============================================

-- ============================================
-- 1. CLEAN UP EXISTING POLICIES
-- ============================================

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  -- Drop all policies on all tables
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'plans', 'locations', 'credential_pools', 'transactions', 'admin_notifications')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ============================================
-- 2. PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow viewing profiles for referral code checking (needed for registration)
CREATE POLICY "Anyone can check referral codes" 
ON profiles FOR SELECT 
USING (true);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 3. PLANS POLICIES
-- ============================================

-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" 
ON plans FOR SELECT 
USING (is_active = true);

-- Admins can manage all plans
CREATE POLICY "Admins can manage all plans" 
ON plans FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 4. LOCATIONS POLICIES
-- ============================================

-- Anyone can view active locations
CREATE POLICY "Anyone can view active locations" 
ON locations FOR SELECT 
USING (is_active = true);

-- Admins can manage all locations
CREATE POLICY "Admins can manage all locations" 
ON locations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 5. CREDENTIAL_POOLS POLICIES
-- ============================================

-- Users can view credentials assigned to them
CREATE POLICY "Users can view assigned credentials" 
ON credential_pools FOR SELECT 
USING (assigned_to = auth.uid());

-- Users can update credentials assigned to them (for status changes)
CREATE POLICY "Users can update assigned credentials" 
ON credential_pools FOR UPDATE 
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- Admins can manage all credentials
CREATE POLICY "Admins can manage all credentials" 
ON credential_pools FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 6. TRANSACTIONS POLICIES
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions" 
ON transactions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
ON transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can update all transactions
CREATE POLICY "Admins can update all transactions" 
ON transactions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 7. ADMIN_NOTIFICATIONS POLICIES
-- ============================================

-- Anyone can view active notifications (based on target audience and date)
CREATE POLICY "Anyone can view active notifications" 
ON admin_notifications FOR SELECT 
USING (
  is_active = true 
  AND (
    target_audience = 'all' 
    OR (
      target_audience = 'users' 
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'user')
    )
    OR (
      target_audience = 'admins' 
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" 
ON admin_notifications FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 8. VERIFY POLICIES
-- ============================================

-- Check that all policies were created
SELECT 
  'Policies Created' as status,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'plans', 'locations', 'credential_pools', 'transactions', 'admin_notifications')
GROUP BY tablename
ORDER BY tablename;

-- Show all policies for verification
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'plans', 'locations', 'credential_pools', 'transactions', 'admin_notifications')
ORDER BY tablename, policyname;

SELECT '✅ RLS policies setup complete!' as status;