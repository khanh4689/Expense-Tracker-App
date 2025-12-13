# Smart Expense Tracker

## Project Description

Smart Expense Tracker is a full-stack web application designed to help users manage their personal finances effectively. The application provides comprehensive expense tracking, budget management, and financial reporting capabilities. Users can register with email verification, log transactions, set budgets, and generate detailed financial reports to gain insights into their spending patterns.

The application solves the common problem of manual expense tracking and provides automated categorization, budget monitoring, and visual reporting. Target users include individuals seeking better financial management, small business owners tracking expenses, and anyone wanting to develop better spending habits.

## Features

- User registration and authentication with email verification
- Google OAuth2 integration for seamless login
- JWT-based stateless authentication
- Transaction management (income and expenses)
- Budget creation and monitoring
- Weekly and monthly financial reports
- Password reset functionality
- Responsive web interface
- Real-time expense categorization
- Data persistence with PostgreSQL
- Containerized deployment with Docker

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security with OAuth2
- Spring Data JPA
- PostgreSQL
- Flyway for database migrations
- JWT for authentication
- Maven for dependency management

### Frontend
- React 18
- TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Axios for API communication
- React Router for navigation
- Framer Motion for animations
- Lucide React for icons

### Database
- PostgreSQL 16
- Flyway migrations
- JPA/Hibernate ORM

### DevOps / Tools
- Docker & Docker Compose
- Nginx for frontend serving
- Maven for backend builds
- Environment-based configuration

### AI-Assisted Development
#### ChatGPT
- Used for system design ideation and architectural planning

- Assisted in backend API design, database schema modeling, and business logic structuring

- Supported frontend UI/UX flow planning and validation logic

- Helped generate technical documentation and setup instructions
#### Anti-Gravity AI (Code Assistant)

- Assisted in implementing business logic for backend services

- Supported frontend component logic and data flow optimization

- Helped refactor and validate database interaction logic

#### Kiro (AI DevOps Assistant)

- Assisted in Dockerfile and Docker Compose configuration

- Supported DevOps workflows, container orchestration, and environment setup

- Helped diagnose build, deployment, and runtime issues in containerized environments

## System Architecture

The application follows a three-tier architecture pattern:

**Frontend Layer**: React-based SPA that communicates with the backend via RESTful APIs. Handles user interactions, form validation, and state management.

**Backend Layer**: Spring Boot application providing REST APIs, business logic, authentication, and authorization. Uses JWT tokens for stateless authentication and integrates with Google OAuth2.

**Database Layer**: PostgreSQL database with JPA entities and Flyway migrations. Stores user data, transactions, budgets, and authentication tokens.

The frontend and backend communicate through HTTP/HTTPS requests, with the backend serving as an API gateway. Authentication is handled via JWT tokens, and the database provides persistent storage with ACID compliance.

## Project Structure

```
├── backend(ExpenseTracker)/          # Spring Boot backend application
│   ├── src/main/java/               # Java source code
│   │   └── com/expensetracker/      # Main package
│   │       ├── controller/          # REST controllers
│   │       ├── service/             # Business logic layer
│   │       ├── repository/          # Data access layer
│   │       ├── entity/              # JPA entities
│   │       ├── dto/                 # Data transfer objects
│   │       ├── security/            # Security configuration
│   │       └── config/              # Application configuration
│   ├── src/main/resources/          # Configuration files
│   │   ├── db/migration/            # Flyway database migrations
│   │   └── application.properties   # Application configuration
│   ├── Dockerfile                   # Backend container configuration
│   └── pom.xml                      # Maven dependencies
├── frontend/smart-expense-tracker-frontend/  # React frontend
│   ├── src/                         # React source code
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components
│   │   ├── api/                     # API service layer
│   │   ├── hooks/                   # Custom React hooks
│   │   └── utils/                   # Utility functions
│   ├── Dockerfile                   # Frontend container configuration
│   ├── nginx.conf                   # Nginx configuration
│   └── package.json                 # Node.js dependencies
├── database/                        # Database initialization
│   ├── init.sql                     # Initial database schema
│   └── Dockerfile                   # Database container configuration
├── docker-compose.yml               # Multi-container orchestration
└── .env.example                     # Environment variables template
```

## Installation & Setup

### Prerequisites

- Docker and Docker Compose
- Java 17 (for local development)
- Node.js 18+ (for local development)
- PostgreSQL 16 (for local development)
- Google Cloud Console account (for OAuth2)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-expense-tracker
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Set up Google OAuth2**
   - Go to Google Cloud Console
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth2 credentials
   - Add authorized origins: `http://localhost:8080`
   - Add redirect URIs: `http://localhost:8080/oauth2/callback/google`

4. **Update .env file**
   ```env
   POSTGRES_DB=expense_tracker
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   MAIL_HOST=smtp.gmail.com
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   ```

## Running the Application

### Development Mode

**Backend:**
```bash
cd backend(ExpenseTracker)
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend/smart-expense-tracker-frontend
npm install
npm run dev
```

**Database:**
```bash
docker run -d --name postgres \
  -e POSTGRES_DB=expense_tracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:16-alpine
```

### Production Mode with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# Clean restart
docker-compose down -v && docker-compose up --build
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
Bearer token authentication using JWT. Include in header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify` - Email verification
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

**OAuth2:**
- `GET /oauth2/google/url` - Get Google OAuth2 URL
- `GET /oauth2/authorization/google` - Initiate Google login

**Transactions:**
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create new transaction
- `GET /transactions/{id}` - Get transaction by ID
- `DELETE /transactions/{id}` - Delete transaction

**Budgets:**
- `GET /budgets` - Get all budgets
- `POST /budgets` - Create new budget

**Reports:**
- `GET /reports/weekly` - Weekly financial report
- `GET /reports/monthly` - Monthly financial report

## Security

### Authentication Strategy
- JWT-based stateless authentication
- Google OAuth2 integration for social login
- Email verification for new accounts
- Password reset with secure tokens

### Authorization
- Simple authentication model without role-based access
- All authenticated users have equal access
- User-specific data isolation through user ID filtering

### Data Protection
- Passwords hashed using BCrypt
- JWT tokens with configurable expiration
- HTTPS enforcement in production
- CORS configuration for cross-origin requests
- SQL injection prevention through JPA
- Input validation on all endpoints

## Testing

### Testing Tools
- JUnit 5 for unit testing
- Spring Boot Test for integration testing
- Mockito for mocking dependencies
- TestContainers for database testing

### Running Tests

**Backend Tests:**
```bash
cd backend(ExpenseTracker)
./mvnw test
```

**Frontend Tests:**
```bash
cd frontend/smart-expense-tracker-frontend
npm test
```

## Common Issues & Troubleshooting

### Database Connection Issues
**Problem:** Backend fails to connect to database
**Solution:** Ensure PostgreSQL is running and credentials in .env are correct

### OAuth2 Configuration
**Problem:** Google login fails with redirect URI mismatch
**Solution:** Verify redirect URIs in Google Console match application configuration

### Port Conflicts
**Problem:** Port 8080 or 3000 already in use
**Solution:** Stop conflicting services or modify port mappings in docker-compose.yml

### Email Verification Not Working
**Problem:** Verification emails not sent
**Solution:** Configure SMTP settings correctly and use app-specific passwords for Gmail

### Docker Build Failures
**Problem:** Docker containers fail to build
**Solution:** Ensure Docker has sufficient memory allocated and clear Docker cache

## Future Improvements

- Implement expense categorization using machine learning
- Add mobile application using React Native
- Integrate with banking APIs for automatic transaction import
- Implement advanced reporting with charts and graphs
- Add multi-currency support
- Implement expense sharing for group budgets
- Add notification system for budget alerts
- Implement data export functionality (PDF, CSV)
- Add dark mode theme support
- Implement caching layer with Redis

## License

MIT License
