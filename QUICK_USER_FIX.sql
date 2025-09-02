-- ============================================
-- QUICK FIX FOR USER ACCESS ISSUES
-- ============================================
-- Run this immediately to fix user access to plans and purchases

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "plans_authenticated_all" ON plans;
DROP POLICY IF EXISTS "plans_allow_all" ON plans;
DROP POLICY IF EXISTS "locations_authenticated_all" ON locations;
DROP POLICY IF EXISTS "locations_allow_all" ON locations;
DROP POLICY IF EXISTS "credential_pools_authenticated_all" ON credential_pools;
DROP POLICY IF EXISTS "credential_pools_allow_all" ON credential_pools;

-- Create permissive policies for testing
-- PLANS: Everyone can view
CREATE POLICY "plans_allow_all_view" 
ON plans FOR SELECT 
USING (true);

-- LOCATIONS: Everyone can view
CREATE POLICY "locations_allow_all_view" 
ON locations FOR SELECT 
USING (true);

-- CREDENTIALS: Allow system to read and update
CREATE POLICY "credentials_allow_read" 
ON credential_pools FOR SELECT 
USING (true);

CREATE POLICY "credentials_allow_update" 
ON credential_pools FOR UPDATE 
USING (true)
WITH CHECK (true);

-- TRANSACTIONS: Allow authenticated users full access to their own
DROP POLICY IF EXISTS "transactions_user_view_own" ON transactions;
DROP POLICY IF EXISTS "transactions_user_insert_own" ON transactions;

CREATE POLICY "transactions_user_all_own" 
ON transactions FOR ALL 
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Grant permissions
GRANT ALL ON plans TO authenticated, anon;
GRANT ALL ON locations TO authenticated, anon;
GRANT ALL ON credential_pools TO authenticated;
GRANT ALL ON transactions TO authenticated;

-- Test the fix
SELECT 'Quick fix applied! Test by:
1. Viewing plans as a user
2. Making a purchase
3. Checking if credentials are assigned' as status;