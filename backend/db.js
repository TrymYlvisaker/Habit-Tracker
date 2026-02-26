// Database connection configuration using postgres.js
import dotenv from 'dotenv'
import postgres from 'postgres'

// Load environment-specific configuration
const envFile = `.env.${process.env.NODE_ENV || 'development'}`
dotenv.config({ path: envFile })

const connectionString = process.env.DATABASE_URL

// Configure postgres connection with SSL and connection pooling
const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false, // Only use SSL in production         
  max: 10,                // Maximum connections in pool
  idle_timeout: 60,       // Close idle connections after 60 seconds
  application_name: 'habit-tracker-app',  
})

export default sql