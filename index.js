import express from 'express'
import 'dotenv/config'
import usersRouter from './routes/users.js'
import habitsRouter from './routes/habits.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use('/users', usersRouter)
app.use('/habits', habitsRouter)

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running!')
})

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})