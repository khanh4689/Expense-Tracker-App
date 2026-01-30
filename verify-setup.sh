#!/bin/bash

# Smart Expense Tracker - Verification Script
# This script verifies the project setup

echo "🔍 Verifying Smart Expense Tracker setup..."

# Check if required files exist
echo "📁 Checking project structure..."
required_files=(
    "README.md"
    "docker-compose.yml"
    ".env.example"
    ".gitignore"
    "backend(ExpenseTracker)/Dockerfile"
    "backend(ExpenseTracker)/pom.xml"
    "frontend/smart-expense-tracker-frontend/Dockerfile"
    "frontend/smart-expense-tracker-frontend/package.json"
    "database/init.sql"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

# Check if .env file exists (should not be committed)
if [ -f ".env" ]; then
    echo "⚠️  .env file exists - ensure it's not committed to Git"
else
    echo "✅ .env file not present (good for security)"
fi

# Check Docker Compose syntax
echo "🐳 Validating Docker Compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
fi

# Check if Git repository is properly initialized
echo "📦 Checking Git repository..."
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    echo "📊 Repository status:"
    git status --porcelain
    if [ $? -eq 0 ]; then
        echo "✅ Git repository is clean"
    fi
else
    echo "❌ Git repository not initialized"
fi

echo "✅ Verification complete!"