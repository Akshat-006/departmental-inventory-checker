import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createLaboratory, getLaboratoryById, updateLaboratory } from '../../services/laboratoryService.js';

const initialState = {
  name: '',
  code: '',
  department: '',
  building: '',
  roomNumber: '',
  capacity: 20,
  description: '',
  isActive: true,
};

export default function LaboratoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    const fetchLab = async () => {
      if (!isEditing) return;
      try {
        const response = await getLaboratoryById(id);
        setForm(response.data.laboratory);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLab();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEditing) {
        await updateLaboratory(id, form);
      } else {
        await createLaboratory(form);
      }
      navigate('/laboratories');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to save laboratory.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit laboratory' : 'Add laboratory'}</h1>
      </div>

      <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="label">Lab name</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Lab code</label>
          <input className="input" name="code" value={form.code} onChange={handleChange} required />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Department</label>
            <input className="input" name="department" value={form.department} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Capacity</label>
            <input className="input" type="number" name="capacity" value={form.capacity} onChange={handleChange} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Building / block</label>
            <input className="input" name="building" value={form.building} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Room number</label>
            <input className="input" name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-24" name="description" value={form.description} onChange={handleChange} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Laboratory is active
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate('/laboratories')}>Cancel</button>
          <button type="submit" className="btn-primary">{isEditing ? 'Update lab' : 'Create lab'}</button>
        </div>
      </form>
    </div>
  );
}
