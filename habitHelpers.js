import sql from './db.js'

export async function needsReset(habit_id) {
  const habit = await sql`
    SELECT frequency
    FROM "habit-tracker".habits
    WHERE id = ${habit_id}
  `
  if (!habit[0]) return null

  const frequency = habit[0].frequency
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  if (frequency === 'weekly') {
    const dayOfWeek = startDate.getDay()
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - offset)
  } else if (frequency === 'monthly') {
    startDate.setDate(1)
  }

  const dateStr = startDate.toISOString()//.slice(0,10) // 'YYYY-MM-DD'

  const logs = await sql`
    SELECT status
    FROM "habit-tracker".habit_logs
    WHERE habit_id = ${habit_id} AND date >= ${dateStr}
    ORDER BY date DESC
    LIMIT 1
  `
  const completed = logs.length > 0 && logs[0].status === true
  return !completed
}