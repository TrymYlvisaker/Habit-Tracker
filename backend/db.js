// Database connection configuration using postgres.js
import postgres from 'postgres'

// Load dotenv only in development (Vercel provides env vars directly)
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv')
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`
  dotenv.config({ path: envFile })
}

// Support both POSTGRES_URL (Vercel default) and DATABASE_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Missing database connection string. Set POSTGRES_URL or DATABASE_URL environment variable.')
}

// Configure postgres connection with SSL and connection pooling
const requiresSsl = connectionString?.includes('sslmode=require') || connectionString?.includes('neon.tech')

const sql = postgres(connectionString, {
  ssl: requiresSsl ? 'require' : false,
  max: 10,                // Maximum connections in pool
  idle_timeout: 60,       // Close idle connections after 60 seconds
  application_name: 'habit-tracker-app',  
})

export default sql