import type { Phase, Settings } from '../../types/pomodoro'

export const getPhaseDurationSeconds = (phase: Phase, settings: Settings): number => {
  if (phase === 'focus') {
    return settings.focusMinutes * 60
  }

  if (phase === 'shortBreak') {
    return settings.shortBreakMinutes * 60
  }

  return settings.longBreakMinutes * 60
}

export const getNextPhase = (
  currentPhase: Phase,
  completedFocusCountInCycle: number,
  longBreakInterval: number,
): Phase => {
  if (currentPhase === 'focus') {
    const safeInterval = Math.max(1, longBreakInterval)
    return completedFocusCountInCycle % safeInterval === 0 ? 'longBreak' : 'shortBreak'
  }

  return 'focus'
}

export const calculateRemainingSeconds = (plannedEndAt: number, now: number = Date.now()): number => {
  const diff = plannedEndAt - now
  if (diff <= 0) {
    return 0
  }

  return Math.ceil(diff / 1000)
}
