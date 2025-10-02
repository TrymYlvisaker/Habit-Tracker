// Database connection configuration using postgres.js
import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

// Configure postgres connection with SSL and connection pooling
const sql = postgres(connectionString, {
  ssl: 'require',         
  max: 10,                // Maximum connections in pool
  idle_timeout: 60,       // Close idle connections after 60 seconds
  application_name: 'habit-tracker-app',  
})

export default sql