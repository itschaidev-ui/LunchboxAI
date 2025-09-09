#!/bin/bash

# Lunchbox AI Discord Bot Startup Script

echo "🍱 Starting Lunchbox AI Discord Bot..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please copy env.example to .env and fill in your tokens."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
mkdir -p logs data

# Deploy slash commands
echo "🚀 Deploying slash commands..."
node deploy.js

# Start the bot
echo "🤖 Starting bot..."
npm start
