#!/bin/bash

# ============================================
# StarNetX Supabase Setup Script
# This script helps you set up Supabase CLI and connect to your project
# ============================================

echo "🚀 Setting up Supabase for StarNetX..."
echo "======================================"

# Check if .env file exists and has real values
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Supabase credentials first."
    exit 1
fi

# Check if .env has placeholder values
if grep -q "your_new_supabase_project_url" .env; then
    echo "⚠️  .env file contains placeholder values!"
    echo "Please update your .env file with real Supabase credentials:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "You can find these in your Supabase project dashboard:"
    echo "  Settings → API"
    exit 1
fi

echo "✅ .env file found with credentials"

# Install Supabase CLI if not already installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://supabase.com/install.sh | sh
        export PATH="$HOME/.local/bin:$PATH"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo "❌ Homebrew not found. Please install Homebrew first or install Supabase CLI manually."
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install Supabase CLI manually from:"
        echo "   https://supabase.com/docs/guides/cli/getting-started"
        exit 1
    fi
    
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI already installed"
fi

# Load environment variables
source .env

# Check if we can connect to Supabase
echo "🔍 Testing connection to Supabase..."
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing Supabase credentials in .env file"
    exit 1
fi

# Test connection using curl
response=$(curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL/rest/v1/" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY")

if [ "$response" = "200" ]; then
    echo "✅ Successfully connected to Supabase"
else
    echo "❌ Failed to connect to Supabase (HTTP $response)"
    echo "Please check your credentials in the .env file"
    exit 1
fi

# Initialize Supabase project if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
    echo "✅ Supabase project initialized"
else
    echo "✅ Supabase project already initialized"
fi

# Link to remote Supabase project
echo "🔗 Linking to remote Supabase project..."
echo "You'll need to provide your project reference ID."
echo "You can find this in your Supabase dashboard URL or project settings."
echo ""

read -p "Enter your Supabase project reference ID: " project_ref

if [ -z "$project_ref" ]; then
    echo "❌ Project reference ID is required"
    exit 1
fi

# Link the project
supabase link --project-ref "$project_ref"

if [ $? -eq 0 ]; then
    echo "✅ Successfully linked to Supabase project"
else
    echo "❌ Failed to link to Supabase project"
    echo "Please check your project reference ID and try again"
    exit 1
fi

echo ""
echo "🎉 Supabase setup complete!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Run the database schema:"
echo "   - Copy the contents of database-schema.sql"
echo "   - Paste into your Supabase SQL Editor and run it"
echo ""
echo "2. Run the RLS policies:"
echo "   - Copy the contents of database-rls-policies.sql"
echo "   - Paste into your Supabase SQL Editor and run it"
echo ""
echo "3. Test the connection:"
echo "   npm run dev"
echo ""
echo "4. Create your first admin user:"
echo "   - Sign up through your app"
echo "   - Update the user's role to 'admin' in the profiles table"
echo ""
echo "Happy coding! 🚀"