import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipment, getEquipmentById, updateEquipment } from '../../services/equipmentService.js';
import { getLaboratories } from '../../services/laboratoryService.js';

const initialState = {
  assetCode: '',
  name: '',
  description: '',
  category: 'Computer',
  manufacturer: '',
  modelNumber: '',
  serialNumber: '',
  laboratory: '',
  totalQuantity: 1,
  availableQuantity: 1,
  condition: 'good',
  minStockThreshold: 1,
  purchaseDate: '',
  purchaseCost: 0,
  supplier: '',
  warrantyExpiry: '',
  remarks: '',
};

export default function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labResponse = await getLaboratories({ limit: 100 });
        setLaboratories(labResponse.data.items || []);

        if (isEditing) {
          const response = await getEquipmentById(id);
          setForm({
            ...response.data.equipment,
            purchaseDate: response.data.equipment.purchaseDate ? response.data.equipment.purchaseDate.slice(0, 10) : '',
            warrantyExpiry: response.data.equipment.warrantyExpiry ? response.data.equipment.warrantyExpiry.slice(0, 10) : '',
            laboratory: response.data.equipment.laboratory?._id || '',
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEditing) {
        await updateEquipment(id, form);
      } else {
        await createEquipment(form);
      }
      navigate('/equipment');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to save equipment.');
    }
  };

  if (loading) return <div className="card p-6">Loading form...</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit equipment' : 'Add equipment'}</h1>
      </div>

      <form className="card space-y-6 p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Asset code</label>
            <input className="input" name="assetCode" value={form.assetCode} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Equipment name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-24" name="description" value={form.description} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" name="category" value={form.category} onChange={handleChange}>
              <option>Computer</option>
              <option>Peripheral</option>
              <option>Networking</option>
              <option>Electronics</option>
              <option>Laboratory Instrument</option>
              <option>Furniture</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label">Laboratory</label>
            <select className="input" name="laboratory" value={form.laboratory} onChange={handleChange}>
              <option value="">Unassigned</option>
              {laboratories.map((lab) => (
                <option key={lab._id} value={lab._id}>{lab.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Manufacturer</label>
            <input className="input" name="manufacturer" value={form.manufacturer} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Model number</label>
            <input className="input" name="modelNumber" value={form.modelNumber} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Serial number</label>
            <input className="input" name="serialNumber" value={form.serialNumber} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Condition</label>
            <select className="input" name="condition" value={form.condition} onChange={handleChange}>
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="warning">Warning</option>
              <option value="damaged">Damaged</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="label">Total quantity</label>
            <input className="input" type="number" min="0" name="totalQuantity" value={form.totalQuantity} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Available quantity</label>
            <input className="input" type="number" min="0" name="availableQuantity" value={form.availableQuantity} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Minimum stock threshold</label>
            <input className="input" type="number" min="0" name="minStockThreshold" value={form.minStockThreshold} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Purchase date</label>
            <input className="input" type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Purchase cost</label>
            <input className="input" type="number" min="0" step="0.01" name="purchaseCost" value={form.purchaseCost} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Supplier</label>
            <input className="input" name="supplier" value={form.supplier} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Warranty expiry</label>
            <input className="input" type="date" name="warrantyExpiry" value={form.warrantyExpiry} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Remarks</label>
            <textarea className="input min-h-24" name="remarks" value={form.remarks} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate('/equipment')}>Cancel</button>
          <button type="submit" className="btn-primary">{isEditing ? 'Update equipment' : 'Create equipment'}</button>
        </div>
      </form>
    </div>
  );
}
