#!/bin/bash

# Smart Expense Tracker - Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Smart Expense Tracker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values"
    echo "   - Set secure passwords"
    echo "   - Configure Google OAuth2 credentials"
    echo "   - Set up email SMTP settings"
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo "   Database: localhost:5432"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Set up Google OAuth2 credentials"
echo "   3. Configure email settings"
echo "   4. Restart services: docker-compose restart"