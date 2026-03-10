import { describe, expect, it } from 'vitest'
import { calculateRemainingSeconds, getNextPhase, getPhaseDurationSeconds } from './machine'

const settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartNextPhase: false,
  soundEnabled: true,
}

describe('timer machine', () => {
  it('calculates phase duration by settings', () => {
    expect(getPhaseDurationSeconds('focus', settings)).toBe(1500)
    expect(getPhaseDurationSeconds('shortBreak', settings)).toBe(300)
    expect(getPhaseDurationSeconds('longBreak', settings)).toBe(900)
  })

  it('switches to long break every configured interval', () => {
    expect(getNextPhase('focus', 1, 4)).toBe('shortBreak')
    expect(getNextPhase('focus', 4, 4)).toBe('longBreak')
    expect(getNextPhase('shortBreak', 4, 4)).toBe('focus')
  })

  it('calculates remaining seconds from timestamps', () => {
    expect(calculateRemainingSeconds(11_000, 10_001)).toBe(1)
    expect(calculateRemainingSeconds(11_000, 11_000)).toBe(0)
    expect(calculateRemainingSeconds(11_000, 12_500)).toBe(0)
  })
})
