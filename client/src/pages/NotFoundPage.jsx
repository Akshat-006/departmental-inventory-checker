import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="card max-w-lg p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">The page you are looking for does not exist or may have moved.</p>
        <Link to="/dashboard" className="btn-primary mt-6">Back to dashboard</Link>
      </div>
    </div>
  );
}
