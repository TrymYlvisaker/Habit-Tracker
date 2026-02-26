// Main server file for the Habit Tracker API
import express from 'express'
import cors from 'cors'
import usersRouter from './Routes/users.js'
import habitsRouter from './Routes/habits.js'

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable. This is required for authentication.')
}

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('WARNING: FRONTEND_URL not set in production. CORS may not work correctly.')
}

const app = express()
const port = process.env.PORT || 3000

// Configure CORS for both local and production environments
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    : ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server runs on 5173 by default
  credentials: true
}

app.use(cors(corsOptions))
// Parse JSON request bodies
app.use(express.json())

// Mount API routes
app.use('/users', usersRouter)
app.use('/habits', habitsRouter)

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running!')
})

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`)
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

// Export for Vercel serverless
export default app