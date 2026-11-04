import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { getEquipment, deleteEquipment } from '../../services/equipmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function EquipmentPage() {
  const { user } = useAuth();
  const canManageEquipment = ['admin', 'lab_assistant'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await getEquipment({ search, limit: 20 });
      setItems(response.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this equipment item?')) return;
    try {
      await deleteEquipment(id);
      fetchEquipment();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete equipment.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipment inventory</h1>
          <p className="text-sm text-slate-500">Track stock, locations, condition, and maintenance state.</p>
        </div>
        {canManageEquipment && (
          <Link to="/equipment/new" className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> New equipment
          </Link>
        )}
      </div>

      <div className="card p-4">
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by asset code or equipment name"
        />
      </div>

      {loading ? (
        <div className="card p-6 text-slate-500">Loading equipment...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No equipment found" description="Create the first inventory record to begin tracking lab resources." />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.assetCode}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.condition} /></td>
                    <td className="px-4 py-3">{item.availableQuantity}/{item.totalQuantity}</td>
                    <td className="px-4 py-3">{item.laboratory?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/equipment/${item._id}`} className="rounded-lg border border-slate-200 p-2 text-slate-700">
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canManageEquipment && (
                          <>
                            <Link to={`/equipment/${item._id}/edit`} className="rounded-lg border border-slate-200 p-2 text-slate-700">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button type="button" onClick={() => handleDelete(item._id)} className="rounded-lg border border-red-200 p-2 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
