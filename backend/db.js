// Database connection configuration using postgres.js
import postgres from 'postgres'

// Load dotenv only in development (Vercel provides env vars directly)
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv')
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`
  dotenv.config({ path: envFile })
}

const connectionString = process.env.DATABASE_URL

// Configure postgres connection with SSL and connection pooling
const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false, // Only use SSL in production         
  max: 10,                // Maximum connections in pool
  idle_timeout: 60,       // Close idle connections after 60 seconds
  application_name: 'habit-tracker-app',  
})

export default sql