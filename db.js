import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

const sql = postgres(connectionString, {
  ssl: 'require',         
  max: 10,
  idle_timeout: 60,
  application_name: 'habit-tracker-app',  
})

export default sql