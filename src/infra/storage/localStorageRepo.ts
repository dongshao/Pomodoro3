import type { PersistedStateV1 } from '../../types/pomodoro'
import { createDefaultPersistedState } from '../../types/pomodoro'
import { migratePersistedState } from './migration'

const STORAGE_KEY = 'pomodoro3.state'

export const loadState = (): PersistedStateV1 => {
  if (typeof window === 'undefined') {
    return createDefaultPersistedState()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return createDefaultPersistedState()
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    return migratePersistedState(parsed)
  } catch {
    return createDefaultPersistedState()
  }
}

export const saveState = (state: PersistedStateV1): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
