-- ============================================
-- EMERGENCY FIX - DISABLE RLS TEMPORARILY
-- ============================================
-- Use this if the other fixes don't work immediately
-- This temporarily disables RLS to allow operations

-- Option 1: Disable RLS completely (NOT RECOMMENDED for production)
-- Uncomment these lines if you need immediate access:
/*
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE credential_pools DISABLE ROW LEVEL SECURITY;
*/

-- Option 2: Create super permissive policies (BETTER OPTION)
-- This keeps RLS enabled but allows everything for authenticated users

-- First, drop ALL existing policies
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on plans
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'plans'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON plans', pol.policyname);
    END LOOP;
    
    -- Drop all policies on locations
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'locations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON locations', pol.policyname);
    END LOOP;
    
    -- Drop all policies on credential_pools
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'credential_pools'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON credential_pools', pol.policyname);
    END LOOP;
END $$;

-- Create new super permissive policies
CREATE POLICY "allow_all_authenticated" ON plans
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_authenticated" ON locations
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_authenticated" ON credential_pools
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant full permissions
GRANT ALL ON plans TO authenticated;
GRANT ALL ON locations TO authenticated;
GRANT ALL ON credential_pools TO authenticated;
GRANT ALL ON admin_notifications TO authenticated;

-- If using sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify
SELECT 
    tablename,
    COUNT(*) as policy_count,
    (SELECT rowsecurity FROM pg_tables WHERE pg_tables.tablename = pg_policies.tablename LIMIT 1) as rls_enabled
FROM pg_policies
WHERE tablename IN ('plans', 'locations', 'credential_pools')
GROUP BY tablename;

-- Test (should work now)
-- INSERT INTO plans (name, duration, duration_hours, price, data_amount, type, is_active) 
-- VALUES ('Test Plan', '1 Day', 24, 100, '1GB', 'daily', true);

-- INSERT INTO locations (name, wifi_name, is_active) 
-- VALUES ('Test Location', 'Test WiFi', true);