import express from 'express'
import sql from '../db.js'

const router = express.Router()

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await sql`SELECT * FROM "habit-tracker".habits`
    res.json(habits)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create a habit
router.post('/', async (req, res) => {
  const { user_id, title, description, frequency } = req.body
  try {
    const newHabit = await sql`
      INSERT INTO "habit-tracker".habits (user_id, title, description, frequency)
      VALUES (${user_id}, ${title}, ${description}, ${frequency})
      RETURNING *
    `
    res.status(201).json(newHabit[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
