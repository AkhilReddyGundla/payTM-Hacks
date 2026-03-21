import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Loader2, CreditCard, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function CustomerDashboard({ customerPhone, onLogout }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payingFor, setPayingFor] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [customerPhone]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/customers/${customerPhone}/dashboard`);
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (txId) => {
    try {
      setPayingFor(txId);
      await api.put(`/transactions/${txId}/pay`);
      toast.success('Payment successful!');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setPayingFor(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 size={32} className="animate-spin text-primary-600" /></div>;
  }

  const { transactions, messages } = data || { transactions: [], messages: [] };
  const pendingTxs = transactions.filter(t => t.status === 'PENDING');
  const totalPending = pendingTxs.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 font-mono text-sm mt-1">{customerPhone}</p>
        </div>
        <button onClick={onLogout} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Logout</button>
      </div>

      {/* Pending Credits Section */}
      <section className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <CreditCard size={20} className="text-primary-500" /> My Pending Dues
        </h3>

        {pendingTxs.length === 0 ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 size={24} />
            <p className="font-medium">You have no pending dues. Great job paying on time!</p>
          </div>
        ) : (
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
            <p className="text-amber-800 font-medium mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-amber-600 mb-4">₹{totalPending}</p>

            <div className="space-y-3">
              {pendingTxs.map(tx => (
                <div key={tx._id} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">₹{tx.amount}</p>
                    <p className="text-xs text-slate-500">at {tx.merchantId?.name || 'Store'} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-700 mt-1 line-clamp-1">{tx.itemText}</p>
                  </div>
                  <button
                    onClick={() => handlePay(tx._id)}
                    disabled={payingFor === tx._id}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm min-w-[80px] flex justify-center"
                  >
                    {payingFor === tx._id ? <Loader2 size={16} className="animate-spin" /> : 'Pay Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Messages Section */}
      <section className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-500" /> My Messages & Offers
        </h3>

        {messages.length === 0 ? (
          <div className="text-slate-500 text-sm italic">No messages received yet.</div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${msg.type === 'OFFER' ? 'bg-indigo-100 text-indigo-700' : 'bg-primary-100 text-primary-700'}`}>
                    {msg.type} from {msg.merchantId?.name || 'Local Store'}
                  </span>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(msg.updatedAt || msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(msg.updatedAt || msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mt-2 pre-wrap">{msg.messageText}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
