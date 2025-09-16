#!/bin/bash

# Setup environment variables for Lunchbox AI Web Dashboard
echo "🍱 Setting up environment variables for Lunchbox AI..."

# Create .env.local file
cat > .env.local << EOF
# Local Environment Variables for Next.js Web Dashboard
# Discord OAuth Credentials
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Groq AI API Key
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ Environment variables set up successfully!"
echo "📝 Created .env.local file with all required variables"
echo ""
echo "🚀 You can now run: npm run dev"
echo "🌐 Then visit: http://localhost:3000"
