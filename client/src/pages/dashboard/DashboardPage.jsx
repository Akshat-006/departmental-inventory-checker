import { Activity, AlertTriangle, Boxes, PackageCheck, Wrench, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatCard from '../../components/common/StatCard.jsx';
import { getDashboardStats } from '../../services/dashboardService.js';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardStats();
        setDashboard(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !dashboard) {
    return <div className="text-slate-500">Loading dashboard...</div>;
  }

  const { summary, lowStockEquipment, recentTransactions, stockByCategory } = dashboard;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total equipment" value={summary.totalEquipment} icon={Boxes} detail="Distinct records" />
        <StatCard title="Physical units" value={summary.totalPhysicalUnits} icon={PackageCheck} detail="All tracked stock" />
        <StatCard title="Available units" value={summary.availableUnits} icon={Activity} detail="Ready for issue" accent="text-emerald-600" />
        <StatCard title="Issued units" value={summary.issuedUnits} icon={ArrowUpRight} detail="Currently checked out" accent="text-blue-600" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Damaged or unavailable" value={summary.damagedUnits} icon={AlertTriangle} detail="Needs attention" accent="text-red-600" />
        <StatCard title="Pending maintenance" value={summary.pendingMaintenance} icon={Wrench} detail="Open work orders" accent="text-violet-600" />
        <StatCard title="Overdue returns" value={summary.overdueTransactions} icon={Activity} detail="Past due dates" accent="text-amber-600" />
        <StatCard title="Low stock" value={lowStockEquipment.length} icon={Boxes} detail="Below threshold" accent="text-orange-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent transactions</h3>
          </div>

          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-500">No recent transactions.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-800">{tx.equipment?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{tx.borrowerName} · {tx.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{tx.quantity} units</p>
                    <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-900">Stock by category</h3>
          <div className="mt-4 space-y-4">
            {stockByCategory.length === 0 ? (
              <p className="text-sm text-slate-500">No stock data available.</p>
            ) : (
              stockByCategory.map((item) => (
                <div key={item._id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{item._id}</span>
                    <span className="font-medium text-slate-700">{item.total}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-2.5 rounded-full bg-brand-500" style={{ width: `${Math.min(item.total / Math.max(summary.availableUnits, 1) * 100, 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold text-slate-900">Low-stock equipment</h3>
        <div className="mt-4 table-wrap">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Asset</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Available</th>
                <th className="pb-3">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {lowStockEquipment.map((item) => (
                <tr key={item._id} className="border-t border-slate-200">
                  <td className="py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="py-3 text-slate-600">{item.category}</td>
                  <td className="py-3 text-slate-700">{item.availableQuantity}</td>
                  <td className="py-3 text-slate-700">{item.minStockThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
