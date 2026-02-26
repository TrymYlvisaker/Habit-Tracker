// Database setup script - creates schema and tables for Habit Tracker
import dotenv from 'dotenv'

// Load environment-specific configuration
// In production/Vercel, env vars are already provided
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`
  dotenv.config({ path: envFile })
}

// Validate DATABASE_URL before importing db.js
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set')
  console.error('Make sure your environment variables are configured')
  process.exit(1)
}

import sql from './db.js'

async function setupDatabase() {
  try {
    console.log('Setting up database...')
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

    // Create schema
    console.log('Creating schema...')
    await sql`CREATE SCHEMA IF NOT EXISTS "habit-tracker"`
    console.log('Schema created\n')

    // Create users table
    console.log('Creating users table...')
    await sql`
      CREATE TABLE IF NOT EXISTS "habit-tracker".users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('Users table created\n')

    // Create habits table
    console.log('Creating habits table...')
    await sql`
      CREATE TABLE IF NOT EXISTS "habit-tracker".habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "habit-tracker".users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        frequency VARCHAR(50) DEFAULT 'daily',
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        streak INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('Habits table created\n')

    // Create habit_logs table
    console.log('Creating habit_logs table...')
    await sql`
      CREATE TABLE IF NOT EXISTS "habit-tracker".habit_logs (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES "habit-tracker".habits(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('Habit logs table created\n')

    // Create indexes for better performance
    console.log('Creating indexes...')
    await sql`CREATE INDEX IF NOT EXISTS idx_habits_user_id ON "habit-tracker".habits(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON "habit-tracker".habit_logs(habit_id)`
    console.log('Indexes created\n')

    console.log('🎉 Database setup complete!')
    console.log('\nYour database is ready to use!')
    
  } catch (error) {
    console.error('Database setup failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

setupDatabase()
