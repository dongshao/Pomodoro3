interface StatsPanelProps {
  todayCount: number
  weekCount: number
}

export const StatsPanel = ({ todayCount, weekCount }: StatsPanelProps) => (
  <section className="rounded-3xl border border-indigo-200/80 bg-white/75 p-6 shadow-lg shadow-indigo-100 backdrop-blur">
    <h3 className="mb-4 text-xl font-bold text-slate-900">统计概览</h3>
    <div className="grid grid-cols-2 gap-3">
      <article className="rounded-2xl bg-indigo-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-indigo-600">今日番茄</p>
        <p className="mt-2 text-3xl font-bold text-indigo-900">{todayCount}</p>
      </article>
      <article className="rounded-2xl bg-sky-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-sky-600">本周番茄</p>
        <p className="mt-2 text-3xl font-bold text-sky-900">{weekCount}</p>
      </article>
    </div>
  </section>
)
