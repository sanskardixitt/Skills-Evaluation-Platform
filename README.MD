# Skill Assessment & Reporting Portal

> A full-stack web application for conducting skill-based assessments with comprehensive performance analytics and reporting.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)  
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)  
[![Prisma](https://img.shields.io/badge/Prisma-5.7-brightgreen.svg)](https://www.prisma.io/)  
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)  
[![Supabase](https://img.shields.io/badge/Supabase-2023-3ECF8E.svg)](https://supabase.com/)

## Overview

A secure, scalable quiz platform enabling users to:

- Take skill-based multiple-choice assessments
- Track performance history and analytics
- Identify skill gaps through intelligent reporting

Administrators can:

- Manage questions and skill categories
- Monitor user performance across the platform
- Generate aggregate performance reports

## Key Features

- **JWT Authentication** - Secure token-based authentication with role-based access control
- **Real-time Quiz Engine** - Dynamic question selection and instant score calculation
- **Performance Analytics** - Comprehensive reporting with skill gap identification
- **RESTful API** - Clean, documented API following REST principles
- **Prisma ORM** - Type-safe database access with automatic migrations
- **Responsive UI** - Mobile-friendly React interface

## Tech Stack

**Backend**

- Node.js & Express.js
- Prisma ORM
- MySQL 8.0
- JWT for authentication
- bcryptjs for password hashing

**Frontend**

- React 18.2
- React Router v6
- Axios for API calls
- Recharts for data visualization

**DevOps**

- Docker & Docker Compose
- Prisma Migrate for database versioning
- Environment-based configuration

## Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/skill-assessment-portal.git
cd skill-assessment-portal

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE skill_assessment;
EXIT;
```

### 3. Environment Configuration

**Backend** (`backend/.env`):

```env
DATABASE_URL="mysql://root:password@localhost:3306/skill_assessment"
JWT_SECRET="your-secret-key-min-32-characters-long"
JWT_EXPIRE="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Initialize Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed sample data
npm run prisma:seed
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Access the application at `http://localhost:3000`

## Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Default Credentials

After seeding, use these credentials:

**Admin Account**

- Email: `admin@skillportal.com`
- Password: `admin123`

**Test User**

- Email: `john@example.com`
- Password: `user123`

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### Protected Endpoints

All protected endpoints require:

```http
Authorization: Bearer {token}
```

#### Quiz Operations

**Start Quiz**

```http
POST /quiz/start
{
  "skillId": 1,
  "questionCount": 10
}
```

**Submit Quiz**

```http
POST /quiz/submit
{
  "attemptId": 123,
  "answers": [
    { "questionId": 1, "selectedAnswer": "A" }
  ]
}
```

**Get Performance Report**

```http
GET /quiz/performance?timePeriod=month
```

## Project Structure

```
skill-assessment-portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Migration history
│   │   └── seed.js             # Sample data
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js       # Prisma client
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Helper functions
│   │   └── app.js              # Express config
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React context
│   │   ├── services/           # API client
│   │   └── App.jsx
│   ├── .env
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Database Schema

```
users
├── id (PK)
├── email (unique)
├── passwordHash
├── fullName
├── role (USER|ADMIN)
└── timestamps

skills
├── id (PK)
├── name (unique)
└── description

questions
├── id (PK)
├── skillId (FK)
├── questionText
├── options (A, B, C, D)
├── correctAnswer
└── difficulty

quiz_attempts
├── id (PK)
├── userId (FK)
├── skillId (FK)
├── score
└── timestamps

quiz_answers
├── id (PK)
├── attemptId (FK)
├── questionId (FK)
├── selectedAnswer
└── isCorrect
```

## Available Scripts

### Backend

```bash
npm run dev              # Start development server
npm start                # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create migration
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio GUI
```

### Frontend

```bash
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# API testing with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"user123"}'
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based stateless authentication
- Role-based access control (RBAC)
- SQL injection prevention via Prisma
- Rate limiting (100 req/15min per IP)
- CORS configuration
- Helmet security headers
- Input validation
- Secure password requirements

## Performance Optimizations

- Database connection pooling
- Indexed database queries
- Pagination on list endpoints
- Efficient Prisma queries with selective field loading
- Frontend code splitting
- API response caching (optional with Redis)

## Troubleshooting

**Database connection failed**

```bash
# Verify MySQL is running
mysql -u root -p

# Check DATABASE_URL format
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Prisma Client not found**

```bash
npx prisma generate
```

**CORS errors**

- Ensure FRONTEND_URL in backend .env matches your frontend URL

## Author

- Email: sanskardixit81@gmail.com

## Acknowledgments

- Prisma for excellent ORM
- Express.js community
- React team for amazing frontend library
