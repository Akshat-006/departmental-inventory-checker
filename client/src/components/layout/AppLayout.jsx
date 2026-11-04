import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar />
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 transition lg:hidden`}>
        <div className="h-full bg-white shadow-xl">
          <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <Topbar title="Departmental System" onMenuToggle={() => setMobileOpen((prev) => !prev)} />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
