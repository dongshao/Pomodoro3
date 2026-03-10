import { createDefaultPersistedState, type PersistedStateV1 } from '../../types/pomodoro'
import { parsePersistedStateV1 } from './schema'

export const migratePersistedState = (input: unknown): PersistedStateV1 => {
  const parsed = parsePersistedStateV1(input)
  if (parsed) {
    return parsed
  }

  return createDefaultPersistedState()
}
