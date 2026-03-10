import { create } from 'zustand'
import { getPhaseDurationSeconds, getNextPhase, calculateRemainingSeconds } from '../domains/timer/machine'
import { loadState, saveState } from '../infra/storage/localStorageRepo'
import type { PersistedStateV1, Phase, Settings, Task, TimerSnapshot } from '../types/pomodoro'
import { getDateKey, upsertCounter } from '../utils/date'

interface PomodoroState {
  settings: Settings
  tasks: Task[]
  counters: PersistedStateV1['counters']
  timer: TimerSnapshot
  lastCompletedEventId: number
  lastCompletedPhase: Phase | null
  lastPersistedAt: number
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipPhase: () => void
  tick: (now?: number) => void
  addTask: (title: string) => void
  toggleTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
  bindTask: (taskId: string | null) => void
  updateSettings: (patch: Partial<Settings>) => void
  persistNow: (force?: boolean) => void
}

const createPersistedState = (state: PomodoroState): PersistedStateV1 => ({
  version: 1,
  settings: state.settings,
  tasks: state.tasks,
  counters: state.counters,
  timer: state.timer,
})

const generateTaskId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const hydrated = loadState()

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  const persistNow = (force: boolean = false): void => {
    const state = get()
    const now = Date.now()

    if (!force && now - state.lastPersistedAt < 10_000) {
      return
    }

    saveState(createPersistedState(state))
    set({ lastPersistedAt: now })
  }

  const transitionPhase = (isCompletion: boolean, now: number): void => {
    const state = get()
    const current = state.timer

    let nextCounters = state.counters
    let nextTasks = state.tasks
    let nextCycleCount = current.completedFocusCountInCycle
    let completedPhase: Phase | null = null

    if (isCompletion && current.phase === 'focus') {
      nextCycleCount += 1
      completedPhase = 'focus'

      const today = getDateKey(new Date(now))
      nextCounters = upsertCounter(nextCounters, today, 1)

      if (current.boundTaskId) {
        nextTasks = nextTasks.map((task) =>
          task.id === current.boundTaskId
            ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
            : task,
        )
      }
    } else if (isCompletion) {
      completedPhase = current.phase
    }

    const nextPhase = getNextPhase(
      current.phase,
      nextCycleCount,
      state.settings.longBreakInterval,
    )

    const nextRemaining = getPhaseDurationSeconds(nextPhase, state.settings)
    const autoStart = state.settings.autoStartNextPhase

    const nextTimer: TimerSnapshot = {
      ...current,
      phase: nextPhase,
      runState: autoStart ? 'running' : 'idle',
      remainingSeconds: nextRemaining,
      startedAt: autoStart ? now : null,
      plannedEndAt: autoStart ? now + nextRemaining * 1000 : null,
      completedFocusCountInCycle: nextCycleCount,
    }

    set((prev) => ({
      tasks: nextTasks,
      counters: nextCounters,
      timer: nextTimer,
      lastCompletedEventId: isCompletion ? prev.lastCompletedEventId + 1 : prev.lastCompletedEventId,
      lastCompletedPhase: isCompletion ? completedPhase : prev.lastCompletedPhase,
    }))

    persistNow(true)
  }

  return {
    settings: hydrated.settings,
    tasks: hydrated.tasks,
    counters: hydrated.counters,
    timer: hydrated.timer,
    lastCompletedEventId: 0,
    lastCompletedPhase: null,
    lastPersistedAt: Date.now(),

    startTimer: () => {
      const state = get()
      if (state.timer.runState === 'running') {
        return
      }

      const now = Date.now()
      const plannedEndAt = now + state.timer.remainingSeconds * 1000

      set((prev) => ({
        timer: {
          ...prev.timer,
          runState: 'running',
          startedAt: now,
          plannedEndAt,
        },
      }))

      persistNow(true)
    },

    pauseTimer: () => {
      const state = get()
      if (state.timer.runState !== 'running') {
        return
      }

      set((prev) => ({
        timer: {
          ...prev.timer,
          runState: 'paused',
          plannedEndAt: null,
          startedAt: null,
        },
      }))

      persistNow(true)
    },

    resetTimer: () => {
      const state = get()
      const duration = getPhaseDurationSeconds(state.timer.phase, state.settings)

      set((prev) => ({
        timer: {
          ...prev.timer,
          runState: 'idle',
          remainingSeconds: duration,
          plannedEndAt: null,
          startedAt: null,
        },
      }))

      persistNow(true)
    },

    skipPhase: () => {
      transitionPhase(false, Date.now())
    },

    tick: (now: number = Date.now()) => {
      const state = get()
      if (state.timer.runState !== 'running' || !state.timer.plannedEndAt) {
        return
      }

      const nextRemaining = calculateRemainingSeconds(state.timer.plannedEndAt, now)
      if (nextRemaining > 0) {
        if (nextRemaining !== state.timer.remainingSeconds) {
          set((prev) => ({
            timer: {
              ...prev.timer,
              remainingSeconds: nextRemaining,
            },
          }))
        }
        return
      }

      transitionPhase(true, now)
    },

    addTask: (title: string) => {
      const cleaned = title.trim()
      if (!cleaned) {
        return
      }

      const task: Task = {
        id: generateTaskId(),
        title: cleaned,
        completed: false,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
      }

      set((prev) => ({
        tasks: [task, ...prev.tasks],
      }))

      persistNow(true)
    },

    toggleTask: (taskId: string) => {
      set((prev) => ({
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      }))

      persistNow(true)
    },

    deleteTask: (taskId: string) => {
      set((prev) => ({
        tasks: prev.tasks.filter((task) => task.id !== taskId),
        timer:
          prev.timer.boundTaskId === taskId
            ? {
                ...prev.timer,
                boundTaskId: null,
              }
            : prev.timer,
      }))

      persistNow(true)
    },

    bindTask: (taskId: string | null) => {
      set((prev) => ({
        timer: {
          ...prev.timer,
          boundTaskId: taskId,
        },
      }))

      persistNow(true)
    },

    updateSettings: (patch: Partial<Settings>) => {
      const state = get()
      const nextSettings: Settings = {
        ...state.settings,
        ...patch,
      }

      const duration = getPhaseDurationSeconds(state.timer.phase, nextSettings)
      const now = Date.now()

      set((prev) => ({
        settings: nextSettings,
        timer: {
          ...prev.timer,
          remainingSeconds: duration,
          startedAt: prev.timer.runState === 'running' ? now : null,
          plannedEndAt: prev.timer.runState === 'running' ? now + duration * 1000 : null,
        },
      }))

      persistNow(true)
    },

    persistNow,
  }
})
