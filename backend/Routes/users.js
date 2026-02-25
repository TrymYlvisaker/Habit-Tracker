// User authentication and management routes
import express from 'express'
import sql from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await sql`SELECT id, name, created_at FROM "habit-tracker".users`
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /users/signup — Register a new user with hashed password
router.post('/signup', async (req, res) => {
  const { name, password } = req.body

  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' })
  }

  try {
    // Hash the password before storing
    const password_hash = await bcrypt.hash(password, 10)

    const newUser = await sql`
      INSERT INTO "habit-tracker".users (name, password_hash)
      VALUES (${name}, ${password_hash})
      RETURNING id, name, created_at
    `

    // Generate JWT token immediately after signup (auto-login)
    const token = jwt.sign(
      { userId: newUser[0].id, name: newUser[0].name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      user: newUser[0],
      token
    })
  } catch (err) {
    if (err.code === '23505') {
      // Unique violation (name already exists)
      return res.status(409).json({ error: 'Name already exists' })
    }
    res.status(500).json({ error: err.message })
  }
})

// POST /users/login — Authenticate user and return JWT token
router.post('/login', async (req, res) => {
  const { name, password } = req.body

  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' })
  }

  try {
    const users = await sql`
      SELECT id, name, password_hash
      FROM "habit-tracker".users
      WHERE name = ${name}
    `

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = users[0]

    // Verify password against stored hash
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Generate JWT token for authenticated session
    const token = jwt.sign(
        { userId: user.id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({ 
        message: 'Login successful', 
        user: { id: user.id, name: user.name }, 
        token 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router