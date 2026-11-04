export default function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
