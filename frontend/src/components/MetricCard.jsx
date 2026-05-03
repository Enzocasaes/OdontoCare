export const MetricCard = ({ title, value, hint }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
    <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</h3>
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
  </article>
);
