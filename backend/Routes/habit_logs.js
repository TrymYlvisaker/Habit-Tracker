// Habit log management routes - track completion history and check reset status
import express from 'express'
import sql from '../db.js'
import { needsReset } from '../habitHelpers.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router();

// GET habit completion logs ordered by date (newest first)
router.get('/:habit_id/logs', authenticateToken, async (req, res) => {
    const { habit_id } = req.params;
    try {
        const logs = await sql`
            SELECT * 
            FROM "habit-tracker".habit_logs 
            WHERE habit_id = ${habit_id} 
            ORDER BY date DESC
        `
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// POST create a new habit log entry
router.post('/:habit_id/logs', authenticateToken, async (req, res) => {
    const { habit_id } = req.params;
    const { status, date } = req.body;
    try {
        const newLog = await sql`
            INSERT INTO "habit-tracker".habit_logs (habit_id, status, date) 
            VALUES (${habit_id}, ${status}, ${date}) 
            RETURNING *
        `
        res.status(201).json(newLog[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add log' });
    }
});

// GET check if habit can be completed (needs reset) for current period
router.get('/:habit_id/needs_reset', authenticateToken, async (req, res) => {
  const { habit_id } = req.params
  try {
    const reset = await needsReset(habit_id)
    if (reset === null) return res.status(404).json({ error: 'Habit not found' })
    res.json({ needs_reset: reset })
  } catch (err) {
    res.status(500).json({ error: 'Failed to check reset status' })
  }
})

export default router
