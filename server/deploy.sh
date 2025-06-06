#!/bin/bash
echo "Preparing to deploy WMS backend to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit for deployment"
fi

# Instructions for manual deployment
echo "===== DEPLOYMENT INSTRUCTIONS ====="
echo "1. Create a new Web Service on Render (https://dashboard.render.com/)"
echo "2. Connect your GitHub repository"
echo "3. Use the following settings:"
echo "   - Name: wms-ai-backend"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "4. Add the following environment variable:"
echo "   - OPENAI_API_KEY: [Your OpenAI API Key]"
echo "5. Click 'Create Web Service'"
echo "=================================="
echo "After deployment, update the VITE_API_URL in .env.production with your Render URL"
