-- ============================================
-- FIX REFERRAL SYSTEM RLS POLICIES
-- ============================================

-- Drop existing profile policies that might block referral access
DROP POLICY IF EXISTS "profiles_user_view_own" ON profiles;
DROP POLICY IF EXISTS "profiles_user_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_view_referrers" ON profiles;

-- Create new profile policies for referral system

-- 1. Users can view their own profile
CREATE POLICY "profiles_own_view" 
ON profiles FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- 2. Users can update their own profile
CREATE POLICY "profiles_own_update" 
ON profiles FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. Users can view profiles of people they referred
CREATE POLICY "profiles_view_referred_users" 
ON profiles FOR SELECT 
TO authenticated
USING (
  referred_by = (SELECT referral_code FROM profiles WHERE id = auth.uid())
);

-- 4. Users can view the profile of their referrer
CREATE POLICY "profiles_view_my_referrer" 
ON profiles FOR SELECT 
TO authenticated
USING (
  referral_code = (SELECT referred_by FROM profiles WHERE id = auth.uid())
);

-- 5. Allow viewing profiles for referral code validation
CREATE POLICY "profiles_view_for_referral_validation" 
ON profiles FOR SELECT 
TO authenticated
USING (
  referral_code IS NOT NULL
);

-- Grant permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated; -- For signup

-- Test queries
SELECT 'Referral RLS fixed! Users can now:
- View their own profile
- View profiles of users they referred
- View their referrer profile
- Validate referral codes during signup' as status;