import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Plus, UserMinus } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import api from '../../services/api.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to deactivate user.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User management</h1>
          <p className="text-sm text-slate-500">Manage access for administrators, lab assistants, and faculty.</p>
        </div>
        <Link to="/users/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> New user
        </Link>
      </div>

      {loading ? (
        <div className="card p-6">Loading users...</div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Add your first user account for the department." />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">{user.department}</td>
                    <td className="px-4 py-3">{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/users/${user._id}/edit`} className="rounded-lg border border-slate-200 p-2 text-slate-700">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button type="button" onClick={() => handleDeactivate(user._id)} className="rounded-lg border border-red-200 p-2 text-red-600">
                          <UserMinus className="h-4 w-4" />
                        </button>
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
