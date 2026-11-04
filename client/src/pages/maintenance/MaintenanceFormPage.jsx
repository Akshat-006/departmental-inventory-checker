import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMaintenanceRecord, getMaintenanceRecords } from '../../services/maintenanceService.js';
import { getEquipment } from '../../services/equipmentService.js';

const initialState = {
  equipment: '',
  issueType: 'damaged',
  description: '',
  reportedBy: '',
  priority: 'medium',
  status: 'reported',
};

export default function MaintenanceFormPage() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await getEquipment({ limit: 100 });
        setEquipmentList(response.data.items || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEquipment();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createMaintenanceRecord(form);
      navigate('/maintenance');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to create maintenance record.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Log maintenance issue</h1>
      </div>

      <form className="card space-y-5 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="label">Equipment</label>
          <select className="input" name="equipment" value={form.equipment} onChange={handleChange} required>
            <option value="">Select equipment</option>
            {equipmentList.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Issue type</label>
            <select className="input" name="issueType" value={form.issueType} onChange={handleChange}>
              <option value="damaged">Damaged</option>
              <option value="malfunctioning">Malfunctioning</option>
              <option value="preventive">Preventive maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="missing">Missing</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Reported by</label>
          <input className="input" name="reportedBy" value={form.reportedBy} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Issue description</label>
          <textarea className="input min-h-28" name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" name="status" value={form.status} onChange={handleChange}>
            <option value="reported">Reported</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate('/maintenance')}>Cancel</button>
          <button type="submit" className="btn-primary">Save record</button>
        </div>
      </form>
    </div>
  );
}
