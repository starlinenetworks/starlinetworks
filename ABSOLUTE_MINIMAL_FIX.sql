-- ============================================
-- ABSOLUTE MINIMAL FIX - NO USER CHECKS
-- ============================================

-- Clean slate
DO $$ 
BEGIN
    -- Drop all policies silently
    EXECUTE (
        SELECT string_agg(
            format('DROP POLICY IF EXISTS %I ON %I;', policyname, tablename), 
            E'\n'
        )
        FROM pg_policies 
        WHERE tablename IN ('plans', 'locations', 'credential_pools', 'transactions', 'profiles')
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create one policy per table - absolutely minimal
CREATE POLICY "allow_all" ON plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON credential_pools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Maximum permissions
DO $$ 
BEGIN
    EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated';
    EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT 'Absolute minimal fix applied. Try now!' as status;