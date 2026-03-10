import { describe, expect, it } from 'vitest'
import { getTodayCount, getWeekCount } from './aggregator'

describe('stats aggregator', () => {
  const counters = [
    { date: '2026-03-09', focusCompleted: 3 },
    { date: '2026-03-10', focusCompleted: 5 },
    { date: '2026-03-01', focusCompleted: 2 },
  ]

  it('returns today count', () => {
    expect(getTodayCount(counters, new Date('2026-03-10T10:00:00'))).toBe(5)
  })

  it('returns week count', () => {
    expect(getWeekCount(counters, new Date('2026-03-10T10:00:00'))).toBe(8)
  })
})
