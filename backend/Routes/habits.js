import express from 'express'
import sql from '../db.js'
import { needsReset } from '../habitHelpers.js'
import { authenticateToken } from '../middleware/auth.js'


const router = express.Router()

// GET all habits for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const habits = await sql`
      SELECT * FROM "habit-tracker".habits
      WHERE user_id = ${req.user.userId}
    `
    res.json(habits)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create a habit
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, frequency } = req.body
  const user_id = req.user.userId

  console.log('req.body:', req.body)
  console.log('req.user:', req.user)

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

// POST mark habit as completed for the current period
router.post('/:habit_id/complete', authenticateToken, async (req, res) => {
  const { habit_id } = req.params
  const user_id = req.user.userId

  try {
    // Ensure the habit belongs to the current user
    const habit = await sql`
      SELECT * FROM "habit-tracker".habits
      WHERE id = ${habit_id} AND user_id = ${user_id}
    `
    if (habit.length === 0) {
      return res.status(404).json({ error: 'Habit not found or not yours' })
    }

    // Check if already logged for current period
    const reset = await needsReset(habit_id)
    if (!reset) return res.status(400).json({ error: 'Already completed this period' })

    // Insert a new habit_log
    const result = await sql`
      INSERT INTO "habit-tracker".habit_logs (habit_id, status, date)
      VALUES (${habit_id}, true, CURRENT_TIMESTAMP)
      RETURNING *
    `
    res.json({ success: true, log: result[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to log habit' })
  }
})


export default router
