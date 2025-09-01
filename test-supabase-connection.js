#!/usr/bin/env node

/**
 * Test script to verify Supabase connection with new credentials
 * Run this after updating your .env file with new Supabase credentials
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('=====================================')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
  process.exit(1)
}

console.log('✅ Environment variables found')
console.log(`📍 Supabase URL: ${supabaseUrl}`)
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)

try {
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('\n🔄 Testing connection...')
  
  // Test basic connection by trying to get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.log('⚠️  Auth test failed (this is normal if no user is logged in):', error.message)
  } else {
    console.log('✅ Auth connection successful')
    if (user) {
      console.log(`👤 Current user: ${user.email}`)
    } else {
      console.log('👤 No user currently logged in')
    }
  }
  
  // Test database connection by trying to fetch a simple table
  console.log('\n🔄 Testing database connection...')
  const { data: profiles, error: dbError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)
  
  if (dbError) {
    console.error('❌ Database connection failed:', dbError.message)
    console.error('This might indicate:')
    console.error('- Wrong Supabase URL')
    console.error('- Wrong anon key')
    console.error('- Database schema not set up')
    console.error('- RLS policies blocking access')
  } else {
    console.log('✅ Database connection successful')
  }
  
  console.log('\n🎉 Supabase connection test completed!')
  
} catch (error) {
  console.error('❌ Connection test failed:', error.message)
  console.error('\nTroubleshooting tips:')
  console.error('1. Verify your Supabase URL is correct')
  console.error('2. Verify your anon key is correct')
  console.error('3. Check if your new Supabase project has the required tables')
  console.error('4. Ensure your new project has the same database schema')
}