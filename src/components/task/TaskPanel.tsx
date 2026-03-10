import { useMemo, useState } from 'react'
import type { Task } from '../../types/pomodoro'

interface TaskPanelProps {
  tasks: Task[]
  boundTaskId: string | null
  onAdd: (title: string) => void
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onBind: (taskId: string | null) => void
}

export const TaskPanel = ({
  tasks,
  boundTaskId,
  onAdd,
  onToggle,
  onDelete,
  onBind,
}: TaskPanelProps) => {
  const [draft, setDraft] = useState('')

  const unfinishedCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  )

  const submit = () => {
    onAdd(draft)
    setDraft('')
  }

  return (
    <section className="rounded-3xl border border-cyan-200/80 bg-white/75 p-6 shadow-lg shadow-cyan-100 backdrop-blur">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">任务列表</h3>
          <p className="text-sm text-slate-600">未完成 {unfinishedCount} 项</p>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit()
            }
          }}
          placeholder="输入任务标题，回车创建"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none ring-sky-300 transition focus:ring"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          添加
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            还没有任务，先添加一个开始专注。
          </li>
        ) : (
          tasks.map((task) => {
            const isBound = boundTaskId === task.id
            return (
              <li
                key={task.id}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <button
                  type="button"
                  onClick={() => onBind(isBound ? null : task.id)}
                  className={`h-5 w-5 rounded-full border transition ${
                    isBound ? 'border-cyan-500 bg-cyan-500' : 'border-slate-300 bg-white'
                  }`}
                  aria-label={isBound ? '取消绑定任务' : '绑定任务到当前番茄'}
                  title={isBound ? '取消绑定' : '绑定到当前番茄'}
                />
                <button
                  type="button"
                  onClick={() => onToggle(task.id)}
                  className={`flex-1 text-left text-sm ${
                    task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </button>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  P {task.pomodoroCount}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="rounded-xl border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  删除
                </button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
