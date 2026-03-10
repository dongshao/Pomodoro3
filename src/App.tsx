import { useEffect, useMemo, useRef, useState } from 'react'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { StatsPanel } from './components/stats/StatsPanel'
import { TaskPanel } from './components/task/TaskPanel'
import { TimerCard } from './components/timer/TimerCard'
import { getTodayCount, getWeekCount } from './domains/stats/aggregator'
import { playChime } from './infra/audio/player'
import {
  getNotificationPermission,
  notifyPhaseCompleted,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from './infra/notification/notifier'
import { usePomodoroStore } from './store/usePomodoroStore'

function App() {
  const timer = usePomodoroStore((state) => state.timer)
  const tasks = usePomodoroStore((state) => state.tasks)
  const counters = usePomodoroStore((state) => state.counters)
  const settings = usePomodoroStore((state) => state.settings)
  const startTimer = usePomodoroStore((state) => state.startTimer)
  const pauseTimer = usePomodoroStore((state) => state.pauseTimer)
  const resetTimer = usePomodoroStore((state) => state.resetTimer)
  const skipPhase = usePomodoroStore((state) => state.skipPhase)
  const tick = usePomodoroStore((state) => state.tick)
  const addTask = usePomodoroStore((state) => state.addTask)
  const toggleTask = usePomodoroStore((state) => state.toggleTask)
  const deleteTask = usePomodoroStore((state) => state.deleteTask)
  const bindTask = usePomodoroStore((state) => state.bindTask)
  const updateSettings = usePomodoroStore((state) => state.updateSettings)
  const persistNow = usePomodoroStore((state) => state.persistNow)
  const lastCompletedEventId = usePomodoroStore((state) => state.lastCompletedEventId)
  const lastCompletedPhase = usePomodoroStore((state) => state.lastCompletedPhase)

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionStatus>(getNotificationPermission())

  const handledEventRef = useRef(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick(Date.now())
    }, 250)

    return () => {
      window.clearInterval(interval)
    }
  }, [tick])

  useEffect(() => {
    if (timer.runState !== 'running') {
      return undefined
    }

    const persistInterval = window.setInterval(() => {
      persistNow(false)
    }, 10_000)

    return () => {
      window.clearInterval(persistInterval)
    }
  }, [persistNow, timer.runState])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick(Date.now())
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [tick])

  useEffect(() => {
    if (lastCompletedEventId <= handledEventRef.current || !lastCompletedPhase) {
      return
    }

    handledEventRef.current = lastCompletedEventId

    if (settings.soundEnabled) {
      playChime()
    }

    notifyPhaseCompleted(lastCompletedPhase)
  }, [lastCompletedEventId, lastCompletedPhase, settings.soundEnabled])

  const boundTaskTitle = useMemo(() => {
    if (!timer.boundTaskId) {
      return null
    }

    return tasks.find((task) => task.id === timer.boundTaskId)?.title ?? null
  }, [tasks, timer.boundTaskId])

  const todayCount = useMemo(() => getTodayCount(counters), [counters])
  const weekCount = useMemo(() => getWeekCount(counters), [counters])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_45%),radial-gradient(circle_at_bottom_left,_#cffafe,_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_45%,_#f0fdfa_100%)] text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">Pomodoro3</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            纯前端番茄钟，专为 GitHub Pages 部署
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            无后端、无登录，数据保存在你的浏览器本地。支持专注/休息自动流转、任务绑定、统计、通知与提示音。
          </p>
        </header>

        <TimerCard
          phase={timer.phase}
          runState={timer.runState}
          remainingSeconds={timer.remainingSeconds}
          boundTaskTitle={boundTaskTitle}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSkip={skipPhase}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TaskPanel
              tasks={tasks}
              boundTaskId={timer.boundTaskId}
              onAdd={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onBind={bindTask}
            />
          </div>

          <div className="space-y-6">
            <StatsPanel todayCount={todayCount} weekCount={weekCount} />
            <SettingsPanel
              settings={settings}
              notificationPermission={notificationPermission}
              onChange={updateSettings}
              onRequestNotification={async () => {
                const permission = await requestNotificationPermission()
                setNotificationPermission(permission)
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
