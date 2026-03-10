import type { Settings } from '../../types/pomodoro'
import type { NotificationPermissionStatus } from '../../infra/notification/notifier'

interface SettingsPanelProps {
  settings: Settings
  notificationPermission: NotificationPermissionStatus
  onChange: (patch: Partial<Settings>) => void
  onRequestNotification: () => void
}

interface NumberSettingItemProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (nextValue: number) => void
}

const NumberSettingItem = ({
  label,
  value,
  min,
  max,
  onChange,
}: NumberSettingItemProps) => (
  <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
    <span>{label}</span>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(event) => {
        const nextValue = Number(event.target.value)
        if (Number.isNaN(nextValue)) {
          return
        }
        onChange(nextValue)
      }}
      className="w-24 rounded-xl border border-slate-300 bg-white px-2 py-1 text-right outline-none ring-sky-300 focus:ring"
    />
  </label>
)

export const SettingsPanel = ({
  settings,
  notificationPermission,
  onChange,
  onRequestNotification,
}: SettingsPanelProps) => {
  const notificationLabel =
    notificationPermission === 'unsupported'
      ? '当前浏览器不支持通知'
      : `通知权限：${notificationPermission}`

  return (
    <section className="rounded-3xl border border-emerald-200/80 bg-white/75 p-6 shadow-lg shadow-emerald-100 backdrop-blur">
      <h3 className="mb-4 text-xl font-bold text-slate-900">设置</h3>

      <div className="space-y-3">
        <NumberSettingItem
          label="专注时长（分钟）"
          value={settings.focusMinutes}
          min={1}
          max={180}
          onChange={(value) => onChange({ focusMinutes: value })}
        />
        <NumberSettingItem
          label="短休时长（分钟）"
          value={settings.shortBreakMinutes}
          min={1}
          max={60}
          onChange={(value) => onChange({ shortBreakMinutes: value })}
        />
        <NumberSettingItem
          label="长休时长（分钟）"
          value={settings.longBreakMinutes}
          min={1}
          max={120}
          onChange={(value) => onChange({ longBreakMinutes: value })}
        />
        <NumberSettingItem
          label="长休触发（每 N 个专注）"
          value={settings.longBreakInterval}
          min={1}
          max={10}
          onChange={(value) => onChange({ longBreakInterval: value })}
        />

        <label className="flex items-center justify-between text-sm text-slate-700">
          <span>自动开始下一阶段</span>
          <input
            type="checkbox"
            checked={settings.autoStartNextPhase}
            onChange={(event) => onChange({ autoStartNextPhase: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-slate-700">
          <span>提示音</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(event) => onChange({ soundEnabled: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
          />
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-xs text-emerald-700">{notificationLabel}</p>
        <button
          type="button"
          onClick={onRequestNotification}
          className="mt-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
        >
          请求通知权限
        </button>
      </div>
    </section>
  )
}
