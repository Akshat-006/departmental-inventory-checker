import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { deleteLaboratory, getLaboratories } from '../../services/laboratoryService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LaboratoriesPage() {
  const { user } = useAuth();
  const canManageLabs = ['admin', 'lab_assistant'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLabs = async () => {
    try {
      const response = await getLaboratories({ limit: 50 });
      setItems(response.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this laboratory?')) return;
    try {
      await deleteLaboratory(id);
      fetchLabs();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete laboratory.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laboratories</h1>
          <p className="text-sm text-slate-500">Track room assignments, capacity, and equipment distribution.</p>
        </div>
        {canManageLabs && (
          <Link to="/laboratories/new" className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> New lab
          </Link>
        )}
      </div>

      {loading ? (
        <div className="card p-6">Loading laboratories...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No laboratories found" description="Add a new lab to organize your department inventory." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((lab) => (
            <div key={lab._id} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{lab.code}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{lab.name}</h3>
                </div>
                {canManageLabs && (
                  <div className="flex gap-2">
                    <Link to={`/laboratories/${lab._id}/edit`} className="rounded-lg border border-slate-200 p-2 text-slate-700"><Edit className="h-4 w-4" /></Link>
                    <button type="button" onClick={() => handleDelete(lab._id)} className="rounded-lg border border-red-200 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-700">Department:</span> {lab.department}</p>
                <p><span className="font-medium text-slate-700">Building:</span> {lab.building}</p>
                <p><span className="font-medium text-slate-700">Room:</span> {lab.roomNumber}</p>
                <p><span className="font-medium text-slate-700">Equipment:</span> {lab.equipmentCount || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
