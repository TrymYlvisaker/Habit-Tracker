// Habit management routes - create, read, complete, and delete habits
import express from 'express'
import sql from '../db.js'
import { needsReset, calculateStreak } from '../habitHelpers.js'
import { authenticateToken } from '../middleware/auth.js'


const router = express.Router()

// GET all habits for the authenticated user with completion status and streak
router.get('/', authenticateToken, async (req, res) => {
  try {
    const habits = await sql`
      SELECT * FROM "habit-tracker".habits
      WHERE user_id = ${req.user.userId}
    `

    // Enhance each habit with completion status and current streak
    const habitsWithStatus = await Promise.all(
      habits.map(async (habit) => {
        const needsResetResult = await needsReset(habit.id);
        const streak = await calculateStreak(habit.id);
        return {
          ...habit,
          can_complete: needsResetResult !== null ? needsResetResult : true,
          is_completed: needsResetResult !== null ? !needsResetResult : false,
          streak: streak
        };
      })
    );

    res.json(habitsWithStatus)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create a new habit for the authenticated user
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

// POST mark habit as completed for the current period (daily/weekly/monthly)
router.post('/:habit_id/complete', authenticateToken, async (req, res) => {
  const { habit_id } = req.params
  const user_id = req.user.userId

  try {
    // Verify habit ownership before allowing completion
    const habit = await sql`
      SELECT * FROM "habit-tracker".habits
      WHERE id = ${habit_id} AND user_id = ${user_id}
    `
    if (habit.length === 0) {
      return res.status(404).json({ error: 'Habit not found or not yours' })
    }

    // Prevent duplicate completions for the same period
    const reset = await needsReset(habit_id)
    if (!reset) return res.status(400).json({ error: 'Already completed this period' })

    // Insert a new habit_log
    const result = await sql`
      INSERT INTO "habit-tracker".habit_logs (habit_id, status, date)
      VALUES (${habit_id}, true, CURRENT_TIMESTAMP)
      RETURNING *
    `
    
    // Calculate the new streak after completion
    const newStreak = await calculateStreak(habit_id)
    
    res.json({ 
      success: true, 
      log: result[0],
      streak: newStreak 
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to log habit' })
  }
})

// DELETE a habit and all its associated logs
router.delete('/:habit_id', authenticateToken, async (req, res) => {
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

    // Delete all habit logs first (due to foreign key constraint)
    await sql`
      DELETE FROM "habit-tracker".habit_logs
      WHERE habit_id = ${habit_id}
    `

    // Delete the habit
    const deletedHabit = await sql`
      DELETE FROM "habit-tracker".habits
      WHERE id = ${habit_id} AND user_id = ${user_id}
      RETURNING *
    `

    res.json({ 
      success: true, 
      message: 'Habit deleted successfully',
      deleted_habit: deletedHabit[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
})


export default router
