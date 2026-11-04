import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTransaction } from '../../services/transactionService.js';
import { getEquipment } from '../../services/equipmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const initialState = {
  equipment: '',
  borrowerName: '',
  borrowerEmail: '',
  borrowerRole: 'faculty',
  quantity: 1,
  expectedReturnDate: '',
  notes: '',
};

export default function TransactionFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [form, setForm] = useState(() => ({
    ...initialState,
    borrowerName: user?.name || '',
    borrowerEmail: user?.email || '',
    borrowerRole: user?.role || 'faculty',
  }));

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
      await createTransaction(form);
      navigate('/transactions');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to create transaction.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Create equipment request</h1>
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
            <label className="label">Borrower name</label>
            <input className="input" name="borrowerName" value={user?.role === 'faculty' ? user.name : form.borrowerName} onChange={handleChange} required readOnly={user?.role === 'faculty'} />
          </div>
          <div>
            <label className="label">Borrower role</label>
            <input className="input capitalize" value={user?.role?.replace('_', ' ') || form.borrowerRole} readOnly aria-label="Borrower role" />
          </div>
        </div>
        <div>
          <label className="label">Borrower email</label>
          <input className="input" type="email" name="borrowerEmail" value={user?.role === 'faculty' ? user.email : form.borrowerEmail} onChange={handleChange} required readOnly={user?.role === 'faculty'} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Quantity</label>
            <input className="input" type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Expected return date</label>
            <input className="input" type="date" name="expectedReturnDate" value={form.expectedReturnDate} onChange={handleChange} required />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-24" name="notes" value={form.notes} onChange={handleChange} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate('/transactions')}>Cancel</button>
          <button type="submit" className="btn-primary">Submit request</button>
        </div>
      </form>
    </div>
  );
}
