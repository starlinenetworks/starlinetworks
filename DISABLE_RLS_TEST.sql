-- ============================================
-- TEMPORARILY DISABLE RLS FOR TESTING
-- ============================================
-- This completely disables RLS to test if that's the issue

-- Disable RLS on all tables
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE credential_pools DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Check status
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles')
ORDER BY tablename;

SELECT '⚠️ WARNING: RLS is now DISABLED on all tables!

This means:
- No security restrictions
- All users can access all data
- This is for TESTING ONLY

If this works, the issue is definitely RLS policies.

To re-enable RLS later:
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' as warning;