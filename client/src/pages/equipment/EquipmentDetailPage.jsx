import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { getEquipmentById } from '../../services/equipmentService.js';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await getEquipmentById(id);
        setEquipment(response.data.equipment);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEquipment();
  }, [id]);

  if (!equipment) return <div className="card p-6">Loading equipment details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/equipment" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back to inventory
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{equipment.assetCode}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{equipment.name}</h1>
          </div>
          <StatusBadge status={equipment.condition} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Available</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{equipment.availableQuantity}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Total quantity</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{equipment.totalQuantity}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Category</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{equipment.category}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Laboratory</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{equipment.laboratory?.name || 'Unassigned'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Technical details</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Manufacturer</dt><dd>{equipment.manufacturer || '—'}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Model</dt><dd>{equipment.modelNumber || '—'}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Serial number</dt><dd>{equipment.serialNumber || '—'}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Supplier</dt><dd>{equipment.supplier || '—'}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Warranty expiry</dt><dd>{equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString() : '—'}</dd></div>
            </dl>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Inventory notes</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Minimum stock</dt><dd>{equipment.minStockThreshold}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Purchase cost</dt><dd>{equipment.purchaseCost ? `₹${equipment.purchaseCost}` : '—'}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Purchase date</dt><dd>{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '—'}</dd></div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2"><dt>Remarks</dt><dd>{equipment.remarks || '—'}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
