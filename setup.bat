@echo off
echo 🚀 Setting up Smart Expense Tracker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual configuration values
    echo    - Set secure passwords
    echo    - Configure Google OAuth2 credentials
    echo    - Set up email SMTP settings
)

REM Build and start services
echo 🐳 Building and starting Docker containers...
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose ps

echo ✅ Setup complete!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8080
echo    Database: localhost:5432
echo.
echo 📚 Next steps:
echo    1. Edit .env file with your configuration
echo    2. Set up Google OAuth2 credentials
echo    3. Configure email settings
echo    4. Restart services: docker-compose restart

pause