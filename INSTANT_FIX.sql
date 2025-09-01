-- ============================================
-- INSTANT FIX - COPY AND PASTE THIS INTO SUPABASE
-- ============================================

-- Fix credential_pools immediately
DROP POLICY IF EXISTS "Admins can manage credentials" ON credential_pools;
DROP POLICY IF EXISTS "Admin manage credentials" ON credential_pools;
DROP POLICY IF EXISTS "System can read available credentials" ON credential_pools;
DROP POLICY IF EXISTS "credentials_select_admin" ON credential_pools;
DROP POLICY IF EXISTS "credentials_insert_admin" ON credential_pools;
DROP POLICY IF EXISTS "credentials_update_admin" ON credential_pools;
DROP POLICY IF EXISTS "credentials_delete_admin" ON credential_pools;

CREATE POLICY "credential_pools_allow_all" 
ON credential_pools 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also ensure plans and locations are fixed
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
CREATE POLICY "plans_allow_all" ON plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view active locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
CREATE POLICY "locations_allow_all" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON credential_pools TO authenticated;
GRANT ALL ON plans TO authenticated;
GRANT ALL ON locations TO authenticated;

-- Done! Try adding credentials now.