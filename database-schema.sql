-- ============================================
-- StarNetX Complete Database Schema
-- Run this in your new Supabase project SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE PLANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  data_amount TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('3-hour', 'daily', 'weekly', 'monthly')),
  popular BOOLEAN DEFAULT false,
  is_unlimited BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CREATE LOCATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  wifi_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CREATE CREDENTIAL_POOLS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS credential_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'used', 'disabled')),
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CREATE TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  location_id UUID REFERENCES locations(id),
  credential_id UUID REFERENCES credential_pools(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wallet_topup', 'plan_purchase', 'wallet_funding')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'success')),
  reference TEXT,
  flutterwave_reference TEXT,
  flutterwave_tx_ref TEXT,
  payment_method TEXT,
  details JSONB,
  metadata JSONB,
  mikrotik_username TEXT,
  mikrotik_password TEXT,
  expires_at TIMESTAMPTZ,
  purchase_date TIMESTAMPTZ,
  activation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CREATE ADMIN_NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  priority INTEGER DEFAULT 0,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'users', 'admins')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Plans indexes
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(type);

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);

-- Credential pools indexes
CREATE INDEX IF NOT EXISTS idx_credential_pools_status ON credential_pools(status);
CREATE INDEX IF NOT EXISTS idx_credential_pools_assigned_to ON credential_pools(assigned_to);
CREATE INDEX IF NOT EXISTS idx_credential_pools_location_plan ON credential_pools(location_id, plan_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Admin notifications indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_active ON admin_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_dates ON admin_notifications(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target ON admin_notifications(target_audience);

-- ============================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-character code
    code := UPPER(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate referral code
CREATE OR REPLACE FUNCTION validate_referral_code(code text)
RETURNS uuid AS $$
DECLARE
  referrer_id uuid;
BEGIN
  -- Check if the referral code exists and get the user ID
  SELECT id INTO referrer_id
  FROM profiles
  WHERE referral_code = UPPER(code)
  LIMIT 1;
  
  -- Return the referrer ID if found, NULL otherwise
  RETURN referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if referral code exists
CREATE OR REPLACE FUNCTION check_referral_code_exists(code text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE referral_code = UPPER(code)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. CREATE TRIGGERS
-- ============================================

-- Profiles trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Plans trigger
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Locations trigger
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Credential pools trigger
DROP TRIGGER IF EXISTS update_credential_pools_updated_at ON credential_pools;
CREATE TRIGGER update_credential_pools_updated_at
  BEFORE UPDATE ON credential_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Transactions trigger
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Admin notifications trigger
DROP TRIGGER IF EXISTS update_admin_notifications_updated_at ON admin_notifications;
CREATE TRIGGER update_admin_notifications_updated_at
  BEFORE UPDATE ON admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION generate_referral_code TO authenticated;
GRANT EXECUTE ON FUNCTION validate_referral_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_referral_code_exists TO anon, authenticated;

-- ============================================
-- 12. INSERT SAMPLE DATA
-- ============================================

-- Insert sample plans
INSERT INTO plans (name, duration, duration_hours, price, data_amount, type, popular, is_unlimited, is_active) VALUES
('3-Hour Plan', '3 hours', 3, 200.00, 'Unlimited', '3-hour', false, true, true),
('Daily Plan', '24 hours', 24, 500.00, 'Unlimited', 'daily', true, true, true),
('Weekly Plan', '7 days', 168, 2000.00, 'Unlimited', 'weekly', false, true, true),
('Monthly Plan', '30 days', 720, 5000.00, 'Unlimited', 'monthly', false, true, true);

-- Insert sample location
INSERT INTO locations (name, wifi_name, username, password, is_active) VALUES
('Main Location', 'StarNetX-WiFi', 'admin', 'password123', true);

-- Insert sample admin notification
INSERT INTO admin_notifications (title, message, type, priority, target_audience, is_active) VALUES
('Welcome to StarNetX!', 'Thank you for joining our network. Enjoy fast and reliable internet service.', 'success', 1, 'all', true);

-- ============================================
-- 13. VERIFY SETUP
-- ============================================

-- Check tables
SELECT 
  'Tables Created' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'plans', 'locations', 'credential_pools', 'transactions', 'admin_notifications');

-- Check functions
SELECT 
  'Functions Created' as status,
  COUNT(*) as function_count
FROM pg_proc 
WHERE proname IN ('generate_referral_code', 'validate_referral_code', 'check_referral_code_exists', 'update_updated_at_column');

-- Check RLS
SELECT 
  'RLS Enabled' as status,
  COUNT(*) as rls_tables
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('profiles', 'plans', 'locations', 'credential_pools', 'transactions', 'admin_notifications')
  AND c.relrowsecurity = true;

SELECT '✅ Database schema setup complete!' as status;