import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, RotateCcw } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { approveTransaction, getTransactions, issueTransaction, returnTransaction } from '../../services/transactionService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TransactionsPage() {
  const { user } = useAuth();
  const canProcessTransactions = ['admin', 'lab_assistant'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions({ limit: 50 });
      setItems(response.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveTransaction(id);
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to approve request.');
    }
  };

  const handleIssue = async (id) => {
    try {
      await issueTransaction(id);
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to issue equipment.');
    }
  };

  const handleReturn = async (id) => {
    try {
      await returnTransaction(id);
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to record return.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction history</h1>
          <p className="text-sm text-slate-500">Issue, approve, and return laboratory equipment.</p>
        </div>
        <Link to="/transactions/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> New request
        </Link>
      </div>

      {loading ? (
        <div className="card p-6">Loading transactions...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No transactions found" description="Requests will appear here once equipment is issued or returned." />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Borrower</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expected return</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.referenceNumber}</td>
                    <td className="px-4 py-3">{item.equipment?.name || 'Unknown equipment'}</td>
                    <td className="px-4 py-3">{item.borrowerName}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">{item.expectedReturnDate ? new Date(item.expectedReturnDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canProcessTransactions && item.status === 'pending' && (
                          <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-700" onClick={() => handleApprove(item._id)}>
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {canProcessTransactions && item.status === 'approved' && (
                          <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-700" onClick={() => handleIssue(item._id)}>
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {canProcessTransactions && item.status === 'issued' && (
                          <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-700" onClick={() => handleReturn(item._id)}>
                            <RotateCcw className="h-4 w-4" />
                          </button>
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
