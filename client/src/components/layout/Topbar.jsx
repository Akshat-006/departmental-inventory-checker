import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Topbar({ title, onMenuToggle, hideSearch = false }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Department</p>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!hideSearch && (
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
              <Search className="h-4 w-4" />
              <input className="bg-transparent text-sm outline-none" placeholder="Search equipment or users" />
            </div>
          )}
          <button type="button" className="rounded-xl border border-slate-200 p-2 text-slate-600">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
              {user?.name?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
