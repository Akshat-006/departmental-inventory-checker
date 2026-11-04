import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'faculty',
  department: '',
  isActive: true,
};

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditing) return;
      try {
        const response = await api.get(`/users/${id}`);
        setForm({
          name: response.data.user.name,
          email: response.data.user.email,
          password: '',
          role: response.data.user.role,
          department: response.data.user.department,
          isActive: response.data.user.isActive,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/users/${id}`, form);
      } else {
        await api.post('/users', form);
      }
      navigate('/users');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to save user.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit user' : 'Create user'}</h1>
      </div>

      <form className="card space-y-5 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="label">Full name</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        {!isEditing && (
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Role</label>
            <select className="input" name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="lab_assistant">Lab assistant</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" name="department" value={form.department} onChange={handleChange} required />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          User is active
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate('/users')}>Cancel</button>
          <button type="submit" className="btn-primary">{isEditing ? 'Update user' : 'Create user'}</button>
        </div>
      </form>
    </div>
  );
}
