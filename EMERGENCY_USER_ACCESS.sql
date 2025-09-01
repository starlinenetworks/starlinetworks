-- ============================================
-- EMERGENCY FIX - REMOVE ALL RESTRICTIONS
-- ============================================
-- Use this if other fixes don't work
-- This temporarily allows all operations for testing

-- Step 1: Drop ALL existing policies
DO $$ 
DECLARE
    r record;
BEGIN
    -- Drop all policies on all relevant tables
    FOR r IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles', 'admin_notifications')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Create super permissive policies for ALL tables

-- PLANS
CREATE POLICY "allow_all" ON plans FOR ALL USING (true) WITH CHECK (true);

-- LOCATIONS  
CREATE POLICY "allow_all" ON locations FOR ALL USING (true) WITH CHECK (true);

-- CREDENTIAL_POOLS
CREATE POLICY "allow_all" ON credential_pools FOR ALL USING (true) WITH CHECK (true);

-- TRANSACTIONS
CREATE POLICY "allow_all" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- PROFILES
CREATE POLICY "allow_all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- ADMIN_NOTIFICATIONS (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_notifications') THEN
        CREATE POLICY "allow_all" ON admin_notifications FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Step 3: Grant ALL permissions to everyone
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Step 4: Verify
SELECT 
    tablename,
    COUNT(*) as policies,
    'All operations allowed' as status
FROM pg_policies
WHERE tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles')
GROUP BY tablename
ORDER BY tablename;

SELECT '
⚠️ WARNING: All restrictions removed!
This is for testing only. 

Users can now:
✅ View and purchase all plans
✅ Get credentials assigned
✅ View all locations
✅ Use referral system
✅ Access all features

After testing, implement proper policies from FIX_USER_RLS_COMPLETE.sql
' as important_note;