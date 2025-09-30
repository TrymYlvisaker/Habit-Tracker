import express from 'express'
import 'dotenv/config'
import cors from 'cors'  
import usersRouter from './Routes/users.js'
import habitsRouter from './Routes/habits.js'
import habitLogsRouter from './Routes/habit_logs.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/users', usersRouter)
app.use('/habits', habitsRouter)
app.use('/habit_logs', habitLogsRouter)

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running!')
})

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})