-- ============================================
-- SIMPLE FIX - AVOID TYPE CASTING ISSUES
-- ============================================
-- This version avoids UUID/text comparison issues

-- Step 1: Drop all existing policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 2: Create simple policies

-- PLANS: Everyone can read active plans
CREATE POLICY "plans_read_all" 
ON plans FOR SELECT 
USING (is_active = true);

-- PLANS: Authenticated users can manage if admin
CREATE POLICY "plans_admin_manage" 
ON plans FOR INSERT, UPDATE, DELETE 
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- LOCATIONS: Everyone can read active locations
CREATE POLICY "locations_read_all" 
ON locations FOR SELECT 
USING (is_active = true);

-- LOCATIONS: Authenticated users can manage if admin
CREATE POLICY "locations_admin_manage" 
ON locations FOR INSERT, UPDATE, DELETE 
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- CREDENTIALS: Allow reading available credentials
CREATE POLICY "credentials_read_available" 
ON credential_pools FOR SELECT 
USING (status = 'available' OR status = 'used');

-- CREDENTIALS: Allow system to update
CREATE POLICY "credentials_system_update" 
ON credential_pools FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- CREDENTIALS: Admin can manage all
CREATE POLICY "credentials_admin_manage" 
ON credential_pools FOR INSERT, DELETE 
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- TRANSACTIONS: Users see their own
CREATE POLICY "transactions_own" 
ON transactions FOR ALL 
TO authenticated
USING (
  CASE 
    WHEN user_id IS NULL THEN false
    WHEN auth.uid() IS NULL THEN false
    ELSE user_id::text = auth.uid()::text
  END
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  CASE 
    WHEN user_id IS NULL THEN false
    WHEN auth.uid() IS NULL THEN false
    ELSE user_id::text = auth.uid()::text
  END
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PROFILES: Users manage their own
CREATE POLICY "profiles_own" 
ON profiles FOR ALL 
TO authenticated
USING (
  id = auth.uid() 
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  id = auth.uid() 
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PROFILES: Allow viewing for referral validation
CREATE POLICY "profiles_referral_view" 
ON profiles FOR SELECT 
TO authenticated
USING (referral_code IS NOT NULL);

-- Step 3: Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON plans, locations TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify
SELECT 
  tablename,
  COUNT(*) as policy_count,
  'Fixed' as status
FROM pg_policies
WHERE tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles')
GROUP BY tablename
ORDER BY tablename;

SELECT 'Simple fix applied! Test purchasing now.' as message;