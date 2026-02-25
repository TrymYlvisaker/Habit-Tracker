import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connection successful!');
    console.log('Current time from DB:', result[0].now);
    
    const users = await sql`SELECT * FROM users`;
    console.log('Users table:', users);
    
    await sql.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  }
}

testConnection();