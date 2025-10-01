import sql from './db.js'


// Checks if a habit needs to be reset based on its frequency and last completion date
export async function needsReset(habit_id) {
  const habit = await sql`
    SELECT frequency
    FROM "habit-tracker".habits
    WHERE id = ${habit_id}
  `
  if (!habit[0]) return null

  const frequency = habit[0].frequency.toLowerCase()
  
  // Use UTC dates to avoid timezone issues
  const today = new Date()
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))

  let startDate, endDate;

  if (frequency === 'daily') {
    startDate = new Date(todayUTC)
    endDate = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
  } else if (frequency === 'weekly') {
    const dayOfWeek = todayUTC.getUTCDay()
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = 0 offset
    startDate = new Date(todayUTC.getTime() - (offset * 24 * 60 * 60 * 1000))
    endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)) 
  } else if (frequency === 'monthly') {
    startDate = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 1))
    endDate = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() + 1, 1)) // First day of next month
  }

  const startDateStr = startDate.toISOString()
  const endDateStr = endDate.toISOString()

  const logs = await sql`
    SELECT status, date
    FROM "habit-tracker".habit_logs
    WHERE habit_id = ${habit_id} 
      AND date >= ${startDateStr} 
      AND date < ${endDateStr}
      AND status = true
    ORDER BY date DESC
    LIMIT 1
  `
  
  const completed = logs.length > 0
  const canComplete = !completed;
  
  return canComplete
}

// Calculate current streak for a habit
export async function calculateStreak(habit_id) {
  try {
    // Get habit frequency to determine streak calculation logic
    const habitResult = await sql`
      SELECT frequency
      FROM "habit-tracker".habits
      WHERE id = ${habit_id}
    `;
    
    if (!habitResult[0]) {
      return 0;
    }
    
    const frequency = habitResult[0].frequency.toLowerCase(); // Normalize to lowercase
    
    // Get all completion logs for this habit, ordered by date (newest first)
    const logs = await sql`
      SELECT date, status
      FROM "habit-tracker".habit_logs
      WHERE habit_id = ${habit_id} AND status = true
      ORDER BY date DESC
    `;
    
    if (logs.length === 0) {
      return 0;
    }
    
    let streak = 0;
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    
    if (frequency === 'daily') {
      const logDates = logs
        .map(log => {
          const date = new Date(log.date);
          const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
          return utcDate.getTime();
        })
        .filter(dateTime => dateTime <= todayUTC.getTime()) // Filter out future dates
        .sort((a, b) => b - a); // Ensure newest first
      
      if (logDates.length === 0) return 0;
      
      // Find the most recent completion date
      const mostRecentCompletion = Math.max(...logDates);
      
      // Check if most recent completion is today or yesterday
      const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);
      
      let startDate;
      if (mostRecentCompletion === todayUTC.getTime()) {
        startDate = new Date(todayUTC);
        streak = 1;
      } else if (mostRecentCompletion === yesterdayUTC.getTime()) {
        startDate = new Date(yesterdayUTC);
        streak = 1;
      } else {
        return 0;
      }
      
      // Count consecutive days backwards
      let checkDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      
      while (logDates.includes(checkDate.getTime())) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      }
    }
    
    else if (frequency === 'weekly') {
      const getWeekStart = (date) => {
        const d = new Date(date);
        const dayOfWeek = d.getUTCDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0 offset
        const weekStart = new Date(d.getTime() - (offset * 24 * 60 * 60 * 1000));
        return new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate()));
      };
      
      const logWeekStarts = logs
        .map(log => {
          const logDate = new Date(log.date);
          return getWeekStart(logDate).getTime();
        })
        .filter(weekStart => weekStart <= getWeekStart(todayUTC).getTime()) 
        .sort((a, b) => b - a); 
      
      const uniqueWeekStarts = [...new Set(logWeekStarts)];
      
      if (uniqueWeekStarts.length === 0) return 0;
      
      const currentWeekStart = getWeekStart(todayUTC).getTime();
      const lastWeekStart = getWeekStart(new Date(todayUTC.getTime() - 7 * 24 * 60 * 60 * 1000)).getTime();
      const mostRecentWeek = Math.max(...uniqueWeekStarts);
      
      let startWeek;
      if (mostRecentWeek === currentWeekStart) {
        startWeek = currentWeekStart;
        streak = 1;
      } else if (mostRecentWeek === lastWeekStart) {
        startWeek = lastWeekStart;
        streak = 1;
      } else {
        return 0;
      }
      
      let checkWeek = startWeek - (7 * 24 * 60 * 60 * 1000); 
      
      while (uniqueWeekStarts.includes(checkWeek)) {
        streak++;
        checkWeek -= (7 * 24 * 60 * 60 * 1000);
      }
    }
    
    else if (frequency === 'monthly') {
      const logMonthStarts = logs
        .map(log => {
          const date = new Date(log.date);
          return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).getTime();
        })
        .filter(monthStart => {
          const currentMonthStart = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 1)).getTime();
          return monthStart <= currentMonthStart; 
        })
        .sort((a, b) => b - a);
      
      const uniqueMonthStarts = [...new Set(logMonthStarts)];
      
      if (uniqueMonthStarts.length === 0) return 0;
      
      const currentMonthStart = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 1)).getTime();
      const lastMonthStart = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() - 1, 1)).getTime();
      const mostRecentMonth = Math.max(...uniqueMonthStarts);
      
      let startMonth;
      if (mostRecentMonth === currentMonthStart) {
        startMonth = currentMonthStart;
        streak = 1;
      } else if (mostRecentMonth === lastMonthStart) {
        startMonth = lastMonthStart;
        streak = 1;
      } else {
        return 0;
      }
      
      let checkMonthTime = startMonth;
      let checkDate = new Date(checkMonthTime);
      let prevMonthStart = new Date(Date.UTC(checkDate.getUTCFullYear(), checkDate.getUTCMonth() - 1, 1)).getTime();
      
      while (uniqueMonthStarts.includes(prevMonthStart)) {
        streak++;
        checkDate = new Date(prevMonthStart);
        prevMonthStart = new Date(Date.UTC(checkDate.getUTCFullYear(), checkDate.getUTCMonth() - 1, 1)).getTime();
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}