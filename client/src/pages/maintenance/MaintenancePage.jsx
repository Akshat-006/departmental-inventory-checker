import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { getMaintenanceRecords } from '../../services/maintenanceService.js';

export default function MaintenancePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const response = await getMaintenanceRecords({ limit: 50 });
      setItems(response.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance and repairs</h1>
          <p className="text-sm text-slate-500">Track equipment issues, assigned technicians, and resolutions.</p>
        </div>
        <Link to="/maintenance/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> New record
        </Link>
      </div>

      {loading ? (
        <div className="card p-6">Loading maintenance records...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No maintenance records" description="Create a maintenance log when a lab item is damaged or needs servicing." />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Issue type</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reported by</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{item.equipment?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 capitalize">{item.issueType}</td>
                    <td className="px-4 py-3 capitalize">{item.priority}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">{item.reportedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
