-- ============================================
-- CHECK TABLE STRUCTURE AND DATA TYPES
-- ============================================

-- Check the data types of all columns in relevant tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'transactions', 'credential_pools', 'plans', 'locations')
ORDER BY table_name, ordinal_position;

-- Specifically check user_id columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name LIKE '%user%'
ORDER BY table_name;

-- Check what auth.uid() returns
SELECT 
    auth.uid() as auth_uid,
    pg_typeof(auth.uid()) as auth_uid_type;

-- Check profiles table structure
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('id', 'user_id', 'referral_code', 'referred_by');

-- Check transactions table structure  
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'transactions'
AND column_name IN ('id', 'user_id', 'credential_id');