#!/bin/bash
# Deploy script - run this when you have Railway CLI

echo "🚀 Reely Dashboard Deploy"
echo "========================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
fi

# Login to Railway
echo "Opening Railway login..."
railway login

# Link or create project
echo "Linking to Railway project..."
railway link

# Set environment variables
echo "Setting environment variables..."
railway variables set NODE_ENV=production

# Deploy
echo "Deploying..."
railway up

echo "✅ Done! Your dashboard is live."
