import { useState, useEffect } from 'react';
import api from '../api';
import { Loader2, Search, Filter } from 'lucide-react';

export default function TransactionsList({ merchantId }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PAID, PENDING

  useEffect(() => {
    fetchTransactions();
  }, [merchantId]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/transactions?merchantId=${merchantId}`);
      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filter === 'ALL' ? true : t.status === filter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">All Transactions</h2>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['ALL', 'PAID', 'PENDING'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 size={32} className="animate-spin text-primary-600" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500">No transactions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Date/Time</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Customer</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Item</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{tx.customerName || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{tx.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{tx.itemText}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">₹{tx.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      tx.status === 'PAID' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
