import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

const sql = postgres(connectionString, {
  ssl: 'require',         
  max: 10,
  idle_timeout: 60,       
  host: 'aws-1-eu-north-1.pooler.supabase.com:6543', 
  application_name: 'habit-tracker-app',  
})

export default sql