import { z } from 'zod'
import type { PersistedStateV1 } from '../../types/pomodoro'

const phaseSchema = z.enum(['focus', 'shortBreak', 'longBreak'])
const runStateSchema = z.enum(['idle', 'running', 'paused', 'completed'])

const settingsSchema = z.object({
  focusMinutes: z.number().int().min(1).max(180),
  shortBreakMinutes: z.number().int().min(1).max(60),
  longBreakMinutes: z.number().int().min(1).max(120),
  longBreakInterval: z.number().int().min(1).max(10),
  autoStartNextPhase: z.boolean(),
  soundEnabled: z.boolean(),
})

const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  completed: z.boolean(),
  pomodoroCount: z.number().int().min(0),
  createdAt: z.string().min(1),
})

const sessionCounterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  focusCompleted: z.number().int().min(0),
})

const timerSnapshotSchema = z.object({
  phase: phaseSchema,
  runState: runStateSchema,
  remainingSeconds: z.number().int().min(0),
  startedAt: z.number().int().nullable(),
  plannedEndAt: z.number().int().nullable(),
  completedFocusCountInCycle: z.number().int().min(0),
  boundTaskId: z.string().min(1).nullable(),
})

const persistedStateV1Schema = z.object({
  version: z.literal(1),
  settings: settingsSchema,
  tasks: z.array(taskSchema),
  counters: z.array(sessionCounterSchema),
  timer: timerSnapshotSchema,
})

export const parsePersistedStateV1 = (input: unknown): PersistedStateV1 | null => {
  const result = persistedStateV1Schema.safeParse(input)
  if (!result.success) {
    return null
  }

  return result.data
}
