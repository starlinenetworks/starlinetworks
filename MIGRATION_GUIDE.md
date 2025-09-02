# 🚀 StarNetX Supabase Migration Guide

This guide will help you migrate your StarNetX project to a new Supabase account.

## 📋 Prerequisites

1. **New Supabase Project**: Create a new project in your Supabase dashboard
2. **Credentials**: Get your project URL and API keys from Settings → API
3. **Environment Variables**: Update your `.env` file with new credentials

## 🔧 Step 1: Update Environment Variables

First, update your `.env` file with your new Supabase credentials:

```bash
# Your new Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co

# Your new Supabase anon key
VITE_SUPABASE_ANON_KEY=your_new_anon_key

# Your new Supabase service role key (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key

# Flutterwave (if using payments)
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

## 🗄️ Step 2: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the contents of `database-schema.sql`**
4. **Click "Run" to execute the schema**

### Option B: Using Supabase CLI

1. **Run the setup script:**
   ```bash
   ./setup-supabase.sh
   ```

2. **Or manually install and link:**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize project
   supabase init
   
   # Link to your project
   supabase link --project-ref your-project-id
   ```

## 🔒 Step 3: Set Up RLS Policies

1. **In your Supabase SQL Editor**
2. **Copy and paste the contents of `database-rls-policies.sql`**
3. **Click "Run" to execute the policies**

## 🧪 Step 4: Test the Connection

1. **Test locally:**
   ```bash
   node test-supabase-connection.js
   ```

2. **Start your development server:**
   ```bash
   npm run dev
   ```

3. **Test in browser:**
   - Open your app
   - Try to sign up/login
   - Check browser console for any errors

## 👤 Step 5: Create Admin User

1. **Sign up through your app** (this creates a user profile)
2. **Go to your Supabase dashboard → Table Editor → profiles**
3. **Find your user and update the `role` field to `admin`**

## 🚀 Step 6: Deploy to Production

### For Netlify:

1. **Update `netlify.toml`:**
   ```toml
   [build.environment]
     NODE_VERSION = "18"
     VITE_SUPABASE_URL = "your_supabase_project_url"
     VITE_SUPABASE_ANON_KEY = "your_supabase_anon_key"
     SUPABASE_URL = "your_supabase_project_url"
     SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key"
     FLUTTERWAVE_SECRET_KEY = "your_flutterwave_secret_key"
   ```

2. **Or set environment variables in Netlify dashboard:**
   - Go to Site Settings → Environment Variables
   - Add all the variables from your `.env` file

### For Other Platforms:

Set the same environment variables in your deployment platform.

## 🔍 Troubleshooting

### Connection Issues

1. **Check your credentials:**
   ```bash
   # Test with curl
   curl -H "apikey: YOUR_ANON_KEY" \
        -H "Authorization: Bearer YOUR_ANON_KEY" \
        "YOUR_SUPABASE_URL/rest/v1/"
   ```

2. **Verify RLS policies:**
   - Check that all tables have RLS enabled
   - Verify policies are correctly set up

### Data Not Loading

1. **Check browser console for errors**
2. **Verify user authentication**
3. **Check RLS policies allow data access**

### Admin Functions Not Working

1. **Verify user has `admin` role in profiles table**
2. **Check admin-specific RLS policies**

## 📊 Database Schema Overview

Your database includes these tables:

- **`profiles`**: User accounts and wallet balances
- **`plans`**: Internet plans and pricing
- **`locations`**: WiFi locations and credentials
- **`credential_pools`**: Available credentials for each plan/location
- **`transactions`**: Payment and purchase history
- **`admin_notifications`**: System notifications

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation**: Users can only see their own data
- **Admin privileges**: Admins can manage all data
- **Referral system**: Secure referral code validation
- **Payment integration**: Secure transaction handling

## 📝 Additional SQL Files

If you need to run additional fixes or updates:

- `SUPABASE_FINAL_FIX.sql`: Fixes ID mismatches and policy issues
- `SUPABASE_RLS_POLICIES.sql`: Alternative RLS policy setup
- `CREATE_NOTIFICATIONS_TABLE.sql`: Just the notifications table
- `FIX_PLAN_DURATIONS.sql`: Plan duration fixes

## 🆘 Need Help?

1. **Check the browser console** for JavaScript errors
2. **Check Supabase logs** in your dashboard
3. **Verify environment variables** are set correctly
4. **Test with the connection script** provided

## ✅ Verification Checklist

- [ ] `.env` file updated with new credentials
- [ ] Database schema created successfully
- [ ] RLS policies applied
- [ ] Connection test passes
- [ ] App loads without errors
- [ ] User registration works
- [ ] Admin user created
- [ ] Production deployment configured

---

**🎉 Congratulations!** Your StarNetX project is now connected to your new Supabase account!