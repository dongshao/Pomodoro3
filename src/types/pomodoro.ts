export type Phase = 'focus' | 'shortBreak' | 'longBreak'
export type RunState = 'idle' | 'running' | 'paused' | 'completed'

export interface Settings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  autoStartNextPhase: boolean
  soundEnabled: boolean
}

export interface Task {
  id: string
  title: string
  completed: boolean
  pomodoroCount: number
  createdAt: string
}

export interface SessionCounter {
  date: string
  focusCompleted: number
}

export interface TimerSnapshot {
  phase: Phase
  runState: RunState
  remainingSeconds: number
  startedAt: number | null
  plannedEndAt: number | null
  completedFocusCountInCycle: number
  boundTaskId: string | null
}

export interface PersistedStateV1 {
  version: 1
  settings: Settings
  tasks: Task[]
  counters: SessionCounter[]
  timer: TimerSnapshot
}

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartNextPhase: false,
  soundEnabled: true,
}

export const createDefaultTimerSnapshot = (
  settings: Settings = DEFAULT_SETTINGS,
): TimerSnapshot => ({
  phase: 'focus',
  runState: 'idle',
  remainingSeconds: settings.focusMinutes * 60,
  startedAt: null,
  plannedEndAt: null,
  completedFocusCountInCycle: 0,
  boundTaskId: null,
})

export const createDefaultPersistedState = (): PersistedStateV1 => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  tasks: [],
  counters: [],
  timer: createDefaultTimerSnapshot(DEFAULT_SETTINGS),
})
