import type { SessionCounter } from '../../types/pomodoro'
import { getDateKey, isDateWithinSameWeek } from '../../utils/date'

export const getTodayCount = (counters: SessionCounter[], now: Date = new Date()): number => {
  const today = getDateKey(now)
  return counters.find((item) => item.date === today)?.focusCompleted ?? 0
}

export const getWeekCount = (counters: SessionCounter[], now: Date = new Date()): number =>
  counters.reduce((sum, item) => {
    if (!isDateWithinSameWeek(item.date, now)) {
      return sum
    }

    return sum + item.focusCompleted
  }, 0)
