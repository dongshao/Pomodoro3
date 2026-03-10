import type { Phase, RunState } from '../../types/pomodoro'
import { formatSeconds } from '../../utils/time'

interface TimerCardProps {
  phase: Phase
  runState: RunState
  remainingSeconds: number
  boundTaskTitle: string | null
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
}

const phaseTextMap: Record<Phase, string> = {
  focus: '专注中',
  shortBreak: '短休息',
  longBreak: '长休息',
}

export const TimerCard = ({
  phase,
  runState,
  remainingSeconds,
  boundTaskTitle,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerCardProps) => {
  const isRunning = runState === 'running'

  return (
    <section className="rounded-3xl border border-sky-200/80 bg-white/75 p-6 shadow-xl shadow-sky-100 backdrop-blur md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-500">当前阶段</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{phaseTextMap[phase]}</h2>
        </div>
        <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-sm font-medium text-sky-700">
          状态：{runState}
        </div>
      </header>

      <p className="text-center text-7xl font-bold tracking-tight text-slate-900 sm:text-8xl">
        {formatSeconds(remainingSeconds)}
      </p>

      <p className="mt-4 min-h-6 text-center text-sm text-slate-600">
        {boundTaskTitle ? `当前绑定任务：${boundTaskTitle}` : '未绑定任务（可在任务面板选择）'}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={isRunning ? onPause : onStart}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {isRunning ? '暂停' : '开始'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          重置
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          跳过
        </button>
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-500">
          GitHub Pages Ready
        </div>
      </div>
    </section>
  )
}
