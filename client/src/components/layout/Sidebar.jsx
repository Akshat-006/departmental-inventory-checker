import { BarChart3, Boxes, Building2, ClipboardList, ShieldCheck, Wrench, Users, LogOut, BookOpenCheck, PackageCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: BarChart3, roles: ['admin', 'lab_assistant', 'faculty'] },
  { label: 'Equipment', to: '/equipment', icon: Boxes, roles: ['admin', 'lab_assistant', 'faculty'] },
  { label: 'Laboratories', to: '/laboratories', icon: Building2, roles: ['admin', 'lab_assistant', 'faculty'] },
  { label: 'Transactions', to: '/transactions', icon: ClipboardList, roles: ['admin', 'lab_assistant', 'faculty'] },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench, roles: ['admin', 'lab_assistant', 'faculty'] },
  { label: 'Users', to: '/users', icon: Users, roles: ['admin'] },
  { label: 'Reports', to: '/reports', icon: BookOpenCheck, roles: ['admin', 'lab_assistant'] },
  { label: 'Profile', to: '/profile', icon: ShieldCheck, roles: ['admin', 'lab_assistant', 'faculty'] },
];

export default function Sidebar({ mobile = false, onNavigate }) {
  const { user, logout } = useAuth();

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role || 'faculty'));

  return (
    <aside className={`${mobile ? 'h-full flex' : 'sticky top-0 hidden h-screen shrink-0 border-r lg:flex'} w-72 bg-white p-5 flex-col`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-700">
          <PackageCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inventory</p>
          <h1 className="text-lg font-bold text-slate-900">Labs Desk</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {visibleItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
            onClick={onNavigate}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Logged in as</p>
        <p className="mt-1 font-medium text-slate-800">{user?.name}</p>
        <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>

      <button
        type="button"
        onClick={async () => {
          await logout();
          onNavigate?.();
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
