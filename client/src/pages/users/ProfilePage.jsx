import { useAuth } from '../../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{user?.name}</h1>
        <p className="mt-2 text-sm text-slate-500">{user?.email}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Role</p>
            <p className="mt-2 text-lg font-semibold capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Department</p>
            <p className="mt-2 text-lg font-semibold">{user?.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
