import { describe, expect, it } from 'vitest'
import { migratePersistedState } from './migration'

describe('persisted state migration', () => {
  it('returns default state for invalid payload', () => {
    const migrated = migratePersistedState({ foo: 'bar' })
    expect(migrated.version).toBe(1)
    expect(migrated.settings.focusMinutes).toBe(25)
  })

  it('keeps valid v1 payload', () => {
    const payload = {
      version: 1,
      settings: {
        focusMinutes: 20,
        shortBreakMinutes: 5,
        longBreakMinutes: 10,
        longBreakInterval: 4,
        autoStartNextPhase: true,
        soundEnabled: false,
      },
      tasks: [],
      counters: [],
      timer: {
        phase: 'focus',
        runState: 'idle',
        remainingSeconds: 1200,
        startedAt: null,
        plannedEndAt: null,
        completedFocusCountInCycle: 0,
        boundTaskId: null,
      },
    }

    const migrated = migratePersistedState(payload)
    expect(migrated.settings.focusMinutes).toBe(20)
    expect(migrated.timer.remainingSeconds).toBe(1200)
  })
})
