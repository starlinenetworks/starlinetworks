-- ============================================
-- COMPLETE FIX FOR ALL USER RLS POLICIES (FIXED VERSION)
-- ============================================
-- This fixes RLS issues preventing users from:
-- 1. Viewing plans
-- 2. Making purchases
-- 3. Getting credentials assigned
-- 4. Using referral system

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on plans
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'plans'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON plans', pol.policyname);
    END LOOP;
    
    -- Drop all policies on locations
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'locations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON locations', pol.policyname);
    END LOOP;
    
    -- Drop all policies on credential_pools
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'credential_pools'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON credential_pools', pol.policyname);
    END LOOP;
    
    -- Drop all policies on transactions
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'transactions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON transactions', pol.policyname);
    END LOOP;
    
    -- Drop all policies on profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 2: CREATE ADMIN CHECK FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS is_admin();
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

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- ============================================
-- STEP 3: PLANS TABLE - EVERYONE CAN VIEW
-- ============================================

-- Everyone (including anonymous) can view active plans
CREATE POLICY "plans_public_view" 
ON plans FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "plans_admin_all" 
ON plans FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- STEP 4: LOCATIONS TABLE - EVERYONE CAN VIEW
-- ============================================

-- Everyone can view active locations
CREATE POLICY "locations_public_view" 
ON locations FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "locations_admin_all" 
ON locations FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- STEP 5: CREDENTIAL_POOLS - SYSTEM ACCESS
-- ============================================

-- System can read available credentials for assignment
CREATE POLICY "credentials_system_read" 
ON credential_pools FOR SELECT 
TO authenticated, anon
USING (status = 'available');

-- System can update credentials during purchase
CREATE POLICY "credentials_system_update" 
ON credential_pools FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "credentials_admin_all" 
ON credential_pools FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- STEP 6: TRANSACTIONS - USER ACCESS
-- ============================================

-- Users can view their own transactions (with proper UUID casting)
CREATE POLICY "transactions_user_view_own" 
ON transactions FOR SELECT 
TO authenticated
USING (user_id::text = auth.uid()::text);

-- Users can create their own transactions (with proper UUID casting)
CREATE POLICY "transactions_user_insert_own" 
ON transactions FOR INSERT 
TO authenticated
WITH CHECK (user_id::text = auth.uid()::text);

-- System can update transactions (for status changes)
CREATE POLICY "transactions_system_update" 
ON transactions FOR UPDATE 
TO authenticated
USING (user_id::text = auth.uid()::text)
WITH CHECK (user_id::text = auth.uid()::text);

-- Admins can do everything
CREATE POLICY "transactions_admin_all" 
ON transactions FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- STEP 7: PROFILES - USER ACCESS
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_user_view_own" 
ON profiles FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_user_update_own" 
ON profiles FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can view referrer profiles (for referral system)
-- Fixed: Using proper text comparison for referral codes
CREATE POLICY "profiles_view_referrers" 
ON profiles FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.referred_by = profiles.referral_code 
    AND p.id = auth.uid()
  )
);

-- System can create profiles during signup
CREATE POLICY "profiles_system_insert" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (id = auth.uid());

-- Admins can do everything
CREATE POLICY "profiles_admin_all" 
ON profiles FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- STEP 8: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant permissions to authenticated and anon users
GRANT SELECT ON plans TO anon, authenticated;
GRANT SELECT ON locations TO anon, authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT, UPDATE ON credential_pools TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION gen_random_uuid() TO authenticated, anon;

-- ============================================
-- STEP 9: VERIFY THE SETUP
-- ============================================

-- Check policies
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles')
GROUP BY tablename
ORDER BY tablename;

-- Test queries (should work now)
-- As a regular user:
-- SELECT * FROM plans WHERE is_active = true;
-- SELECT * FROM locations WHERE is_active = true;
-- SELECT * FROM transactions WHERE user_id = auth.uid();
-- SELECT * FROM profiles WHERE id = auth.uid();

-- ============================================
-- STEP 10: ADDITIONAL FIXES FOR PURCHASES
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS assign_credential_to_purchase(UUID, UUID, UUID, UUID);

-- Ensure credential assignment works during purchase
CREATE OR REPLACE FUNCTION assign_credential_to_purchase(
  p_plan_id UUID,
  p_location_id UUID,
  p_user_id UUID,
  p_transaction_id UUID
) RETURNS UUID AS $$
DECLARE
  v_credential_id UUID;
BEGIN
  -- Find an available credential
  SELECT id INTO v_credential_id
  FROM credential_pools
  WHERE plan_id = p_plan_id
    AND location_id = p_location_id
    AND status = 'available'
  LIMIT 1
  FOR UPDATE;
  
  -- Update the credential
  IF v_credential_id IS NOT NULL THEN
    UPDATE credential_pools
    SET status = 'used',
        assigned_to = p_user_id::text,  -- Cast UUID to text if assigned_to is text
        assigned_at = NOW()
    WHERE id = v_credential_id;
    
    -- Update the transaction
    UPDATE transactions
    SET credential_id = v_credential_id
    WHERE id = p_transaction_id;
  END IF;
  
  RETURN v_credential_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION assign_credential_to_purchase TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'RLS policies fixed! Users should now be able to:
- View all active plans
- View all active locations  
- Make purchases
- Get credentials assigned
- View their transactions
- Use referral system' as status;