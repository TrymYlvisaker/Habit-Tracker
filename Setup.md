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
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
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

Create the required tables in your PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habit logs table for tracking completions
CREATE TABLE habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE DEFAULT CURRENT_DATE
);

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure `FRONTEND_URL` in backend matches your frontend URL exactly
- Include `https://` protocol in production URLs

**Database Connection**
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from your hosting provider

**Authentication Issues**
- Check `JWT_SECRET` is set in backend environment
- Verify frontend is sending tokens in Authorization header