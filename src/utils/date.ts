import type { SessionCounter } from '../types/pomodoro'

const pad = (value: number): string => String(value).padStart(2, '0')

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  return `${year}-${month}-${day}`
}

export const getWeekStart = (date: Date): Date => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)

  const weekday = copy.getDay()
  const offset = weekday === 0 ? -6 : 1 - weekday
  copy.setDate(copy.getDate() + offset)

  return copy
}

export const isDateWithinSameWeek = (dateKey: string, reference: Date): boolean => {
  const parsed = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  const weekStart = getWeekStart(reference)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return parsed >= weekStart && parsed <= weekEnd
}

export const upsertCounter = (
  counters: SessionCounter[],
  targetDate: string,
  delta: number,
): SessionCounter[] => {
  const index = counters.findIndex((item) => item.date === targetDate)

  if (index === -1) {
    return [...counters, { date: targetDate, focusCompleted: Math.max(delta, 0) }]
  }

  const next = [...counters]
  const current = next[index]
  next[index] = {
    ...current,
    focusCompleted: Math.max(0, current.focusCompleted + delta),
  }

  return next
}
