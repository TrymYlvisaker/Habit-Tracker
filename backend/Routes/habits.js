// Habit management routes - create, read, complete, and delete habits
import express from 'express'
import sql from '../db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Helper function to check if a habit needs to be reset based on frequency
function needsReset(completedAt, frequency) {
  if (!completedAt) return false;
  
  const now = new Date();
  const completedDate = new Date(completedAt);
  
  switch (frequency) {
    case 'daily':
      // Reset if completed on a different day
      return completedDate.toDateString() !== now.toDateString();
    case 'weekly':
      // Reset if completed in a different week
      const weekDiff = Math.floor((now - completedDate) / (7 * 24 * 60 * 60 * 1000));
      return weekDiff >= 1;
    case 'monthly':
      // Reset if completed in a different month
      return completedDate.getMonth() !== now.getMonth() || 
             completedDate.getFullYear() !== now.getFullYear();
    default:
      return false;
  }
}

// GET all habits for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    let habits = await sql`
      SELECT * FROM "habit-tracker".habits
      WHERE user_id = ${req.user.userId}
      ORDER BY created_at DESC
    `
    
    // Check each habit to see if it needs to be reset
    const resetPromises = habits.map(async (habit) => {
      if (habit.is_completed && needsReset(habit.completed_at, habit.frequency)) {
        // Reset the habit
        const updated = await sql`
          UPDATE "habit-tracker".habits
          SET is_completed = false,
              completed_at = NULL
          WHERE id = ${habit.id}
          RETURNING *
        `
        return updated[0];
      }
      return habit;
    });
    
    habits = await Promise.all(resetPromises);
    
    res.json(habits)
  } catch (err) {
    console.error('Error fetching habits:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST create a new habit for the authenticated user
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, frequency } = req.body
  const user_id = req.user.userId

  // Validate input
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' })
  }

  if (title.length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or less' })
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description must be 1000 characters or less' })
  }

  const validFrequencies = ['daily', 'weekly', 'monthly']
  const freq = frequency?.toLowerCase() || 'daily'
  if (!validFrequencies.includes(freq)) {
    return res.status(400).json({ error: 'Frequency must be daily, weekly, or monthly' })
  }

  try {
    const newHabit = await sql`
      INSERT INTO "habit-tracker".habits (user_id, title, description, frequency)
      VALUES (${user_id}, ${title}, ${description || ''}, ${freq})
      RETURNING *
    `
    res.status(201).json(newHabit[0])
  } catch (err) {
    console.error('Error creating habit:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST mark habit as completed (keeping POST to match frontend)
router.post('/:habit_id/complete', authenticateToken, async (req, res) => {
  const { habit_id } = req.params
  const user_id = req.user.userId

  try {
    // Verify habit ownership
    const habit = await sql`
      SELECT * FROM "habit-tracker".habits
      WHERE id = ${habit_id} AND user_id = ${user_id}
    `
    
    if (habit.length === 0) {
      return res.status(404).json({ error: 'Habit not found or not yours' })
    }

    // Check if it needs to be reset first
    const shouldReset = needsReset(habit[0].completed_at, habit[0].frequency);
    
    if (shouldReset) {
      // Reset the habit first (streak resets to 0 if missed)
      await sql`
        UPDATE "habit-tracker".habits
        SET is_completed = false,
            streak = 0,
            completed_at = NULL
        WHERE id = ${habit_id}
      `
    }

    // Check if already completed (after potential reset)
    if (habit[0].is_completed && !shouldReset) {
      return res.status(400).json({ error: 'Already completed this period' })
    }

    // Mark as completed and increment streak
    const newStreak = shouldReset ? 1 : (habit[0].streak || 0) + 1;
    
    const updated = await sql`
      UPDATE "habit-tracker".habits
      SET is_completed = true,
          streak = ${newStreak},
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${habit_id} AND user_id = ${user_id}
      RETURNING *
    `
    
    res.json({ 
      success: true,
      habit: updated[0],
      streak: newStreak
    })
  } catch (err) {
    console.error('Error completing habit:', err)
    res.status(500).json({ error: err.message })
  }
})

// DELETE a habit
router.delete('/:habit_id', authenticateToken, async (req, res) => {
  const { habit_id } = req.params
  const user_id = req.user.userId

  try {
    // Verify ownership and delete
    const deletedHabit = await sql`
      DELETE FROM "habit-tracker".habits
      WHERE id = ${habit_id} AND user_id = ${user_id}
      RETURNING *
    `

    if (deletedHabit.length === 0) {
      return res.status(404).json({ error: 'Habit not found or not yours' })
    }

    res.json({ 
      success: true, 
      message: 'Habit deleted successfully',
      deleted_habit: deletedHabit[0]
    })
  } catch (err) {
    console.error('Error deleting habit:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router