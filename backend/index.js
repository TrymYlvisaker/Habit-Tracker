// Main server file for the Habit Tracker API
import express from 'express'
import 'dotenv/config'
import cors from 'cors'  
import usersRouter from './Routes/users.js'
import habitsRouter from './Routes/habits.js'
import habitLogsRouter from './Routes/habit_logs.js'

const app = express()
const port = process.env.PORT || 3000

// Configure CORS for both local and production environments
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] // Replace with your actual Vercel frontend URL
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

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})