#!/bin/bash

echo "🚀 Preparing to send changes to GitHub and trigger the Live CI/CD Pipeline..."
cd /Users/adarshsoni/Downloads/New

# Add all modified files
git add .

# Commit with an automated timestamp message
git commit -m "Auto-Deployment: $(date)"

# Push to Github
git push origin main

echo "✅ Success! Your changes have been pushed to GitHub."
echo "Your GitHub Actions CI/CD Pipeline is now building the website in the cloud."
echo "Changes will be live in ~2 minutes!"
echo ""
echo "Press any key to close this window..."
read -n 1 -s
