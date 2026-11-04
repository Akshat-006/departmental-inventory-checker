const variants = {
  good: 'bg-emerald-100 text-emerald-700',
  new: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  damaged: 'bg-red-100 text-red-700',
  maintenance: 'bg-violet-100 text-violet-700',
  pending: 'bg-slate-100 text-slate-700',
  approved: 'bg-sky-100 text-sky-700',
  issued: 'bg-violet-100 text-violet-700',
  returned: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  overdue: 'bg-orange-100 text-orange-700',
  reported: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-orange-100 text-orange-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();
  const className = variants[normalized] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {status || 'Unknown'}
    </span>
  );
}
