// Main server file for the Habit Tracker API
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

// Load environment-specific configuration
const envFile = `.env.${process.env.NODE_ENV || 'development'}`
dotenv.config({ path: envFile })  
import usersRouter from './Routes/users.js'
import habitsRouter from './Routes/habits.js'
import habitLogsRouter from './Routes/habit_logs.js'
import sql from './db.js'

const app = express()
const port = process.env.PORT || 3000

// Configure CORS for both local and production environments
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app'] // Use environment variable with fallback
    : ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server runs on 5173 by default
  credentials: true
}

app.use(cors(corsOptions))
// Parse JSON request bodies
app.use(express.json())

// Mount API routes
app.use('/users', usersRouter)
app.use('/habits', habitsRouter)
app.use('/habit_logs', habitLogsRouter)

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running!')
})

app.listen(port, async () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: ${process.env.DATABASE_URL.includes('neon.tech') ? 'Neon (Production)' : 'Local PostgreSQL'}`)
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`)
  
  // Test database connection
  try {
    await sql`SELECT NOW()`
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
})