## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** database

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database connection (use either POSTGRES_URL or DATABASE_URL)
DATABASE_URL=your_postgresql_connection_string
# For Vercel deployment, POSTGRES_URL is automatically provided
# POSTGRES_URL=your_vercel_postgres_url

# JWT Secret (required - use a strong random string)
JWT_SECRET=your_jwt_secret_key

# Server configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS - must match your frontend exactly)
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

#### 4. Database Setup

The easiest way to set up your database is to run the setup script:

```bash
cd backend
npm run setup-db
```

This will create the required schema and tables. Alternatively, you can create tables manually:

```sql
-- Create schema
CREATE SCHEMA IF NOT EXISTS "habit-tracker";

-- Users table
CREATE TABLE IF NOT EXISTS "habit-tracker".users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Habits table
CREATE TABLE IF NOT EXISTS "habit-tracker".habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "habit-tracker".users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) DEFAULT 'daily',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE IF NOT EXISTS "habit-tracker".habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES "habit-tracker".habits(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure `FRONTEND_URL` in backend matches your frontend URL exactly

**Database Connection**
- Verify `DATABASE_URL` or `POSTGRES_URL` is correct
- Ensure database is accessible from your hosting provider
- The app will automatically use `POSTGRES_URL` (Vercel) or fall back to `DATABASE_URL`
