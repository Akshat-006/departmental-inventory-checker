import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { getReports } from '../../services/reportService.js';

export default function ReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReports();
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReports();
  }, []);

  if (!data) return <div className="card p-6">Loading reports...</div>;

  const openCsv = (type) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/reports/csv?type=${type}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Monitor inventory health, overdue equipment, and maintenance activity.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => openCsv('inventory')} className="btn-secondary">
            <Download className="mr-2 h-4 w-4" /> Inventory CSV
          </button>
          <button type="button" onClick={() => openCsv('maintenance')} className="btn-secondary">
            <Download className="mr-2 h-4 w-4" /> Maintenance CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.inventorySummary.map((item) => (
          <div key={item._id} className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item._id}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Total units: <span className="font-semibold text-slate-800">{item.totalUnits}</span></p>
              <p>Available: <span className="font-semibold text-slate-800">{item.availableUnits}</span></p>
              <p>Equipment count: <span className="font-semibold text-slate-800">{item.equipmentCount}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-900">Overdue returns</h3>
          <div className="mt-4 space-y-3">
            {data.overdueTransactions.length === 0 ? (
              <p className="text-sm text-slate-500">No overdue transactions.</p>
            ) : (
              data.overdueTransactions.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-800">{item.borrowerName}</p>
                  <p className="text-sm text-slate-600">{item.equipment?.name || 'Equipment'} · {item.quantity} units</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-900">Low-stock items</h3>
          <div className="mt-4 space-y-3">
            {data.lowStockEquipment.length === 0 ? (
              <p className="text-sm text-slate-500">No low-stock items flagged.</p>
            ) : (
              data.lowStockEquipment.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-600">Available {item.availableQuantity} / threshold {item.minStockThreshold}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
