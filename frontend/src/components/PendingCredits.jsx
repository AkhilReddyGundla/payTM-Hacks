import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Loader2, Send, CheckCircle2, RotateCw } from 'lucide-react';

export default function PendingCredits({ merchantId }) {
  const [pending, setPending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [sendingFor, setSendingFor] = useState(null);
  const [generatedMessages, setGeneratedMessages] = useState({});
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState('now'); // 'now' or 'custom'
  const [batchScheduleDate, setBatchScheduleDate] = useState('');
  const [isBatching, setIsBatching] = useState(false);

  useEffect(() => {
    fetchPending();
  }, [merchantId]);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/transactions/pending?merchantId=${merchantId}`);
      setPending(data);
    } catch (error) {
      toast.error('Failed to load pending credits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (tx) => {
    try {
      setGeneratingFor(tx._id);
      const { data } = await api.post('/reminders/generate', { transactionId: tx._id });
      setGeneratedMessages(prev => ({ ...prev, [tx._id]: data.messageText }));
      toast.success('Reminder message generated using AI');
    } catch (error) {
      toast.error('Failed to generate reminder');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSend = async (tx) => {
    const text = generatedMessages[tx._id];
    if (!text) return;

    try {
      setSendingFor(tx._id);
      await api.post('/reminders/send', {
        merchantId,
        customerPhone: tx.customerPhone,
        messageText: text,
        transactionId: tx._id
      });
      
      // Update local state to show it was sent
      setPending(pending.map(p => p._id === tx._id ? { ...p, reminderSent: true } : p));
      toast.success('Reminder sent successfully!');
    } catch (error) {
      toast.error('Failed to send reminder');
    } finally {
      setSendingFor(null);
    }
  };

  const handleScheduleForTomorrow = async (tx) => {
    const text = generatedMessages[tx._id];
    if (!text) return;

    try {
      setSendingFor(tx._id);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

      await api.post('/reminders/send', {
        merchantId,
        customerPhone: tx.customerPhone,
        messageText: text,
        transactionId: tx._id,
        scheduledFor: tomorrow.toISOString()
      });
      
      setPending(pending.map(p => p._id === tx._id ? { ...p, reminderSent: true } : p));
      toast.success('Reminder scheduled for 9 AM tomorrow!');
    } catch (error) {
      toast.error('Failed to schedule reminder');
    } finally {
      setSendingFor(null);
    }
  };
  
  const handleMarkPaid = async (txId, method) => {
    try {
      await api.put(`/transactions/${txId}/pay`, { method });
      setPending(pending.filter(p => p._id !== txId));
      setPaymentModal(null);
      toast.success(`Payment of ₹${paymentModal.amount} received via ${method}! Order Completed.`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const [paymentModal, setPaymentModal] = useState(null);

  const handleBatchNotify = async () => {
    // Only target those who haven't received a reminder yet
    const targetTxs = pending.filter(p => !p.reminderSent);
    
    if (targetTxs.length === 0) {
      toast.error('All pending dues have already received reminders!');
      return;
    }

    try {
      setIsBatching(true);
      const targetDate = scheduleType === 'custom' && batchScheduleDate ? new Date(batchScheduleDate).toISOString() : null;

      await api.post('/reminders/batchReminders', {
        merchantId,
        transactions: targetTxs,
        scheduledFor: targetDate
      });

      // Optimistically update local state
      setPending(pending.map(p => ({ ...p, reminderSent: true })));
      toast.success(`Batch scheduling started for ${targetTxs.length} customers!`);
      setBatchModalOpen(false);
      setBatchScheduleDate('');
    } catch (error) {
      toast.error('Failed to start batch schedule');
    } finally {
      setIsBatching(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 size={32} className="animate-spin text-primary-600" /></div>;
  }

  if (pending.length === 0) {
    return (
      <div className="text-center p-12 bg-emerald-50 rounded-xl border border-emerald-100 border-dashed">
        <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-4" />
        <h3 className="text-lg font-semibold text-emerald-900 mb-1">All clear!</h3>
        <p className="text-emerald-700/80 text-sm">You have no pending dues to collect.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">Pending Dues</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Total: ₹{pending.reduce((acc, tx) => acc + tx.amount, 0)} pending from {pending.length} sale(s)
          </div>
          <button 
            onClick={() => setBatchModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <Send size={16} /> Batch Notify All
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pending.map(tx => (
          <div key={tx._id} className="bg-white border text-sm border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{tx.customerName || 'Guest'}</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{tx.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-amber-600">₹{tx.amount}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg mb-4 text-slate-700 line-clamp-2">
              <span className="font-medium text-slate-900 text-xs uppercase tracking-wider block mb-1">Item Details</span>
              {tx.itemText}
            </div>

            {generatedMessages[tx._id] ? (
              <div className="space-y-3">
                <div className="relative bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-900 animate-in zoom-in-95">
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">AI Draft</span>
                  <p className="pr-4">{generatedMessages[tx._id]}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => handleSend(tx)}
                    disabled={sendingFor === tx._id || tx.reminderSent}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-xs"
                  >
                    {sendingFor === tx._id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {tx.reminderSent ? 'Sent' : 'Send Now'}
                  </button>
                  <button 
                    onClick={() => handleScheduleForTomorrow(tx)}
                    disabled={sendingFor === tx._id || tx.reminderSent}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-xs"
                  >
                    Schedule (Tmrw)
                  </button>
                  <button onClick={() => handleGenerate(tx)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200" title="Regenerate">
                    <RotateCw size={18} className={generatingFor === tx._id ? "animate-spin" : ""} />
                  </button>
                  <button onClick={() => setPaymentModal(tx)} className="px-3 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-lg transition-colors bg-emerald-50/50 flex items-center justify-center text-xs font-bold uppercase leading-none" title="Collect Payment">
                    Collect
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleGenerate(tx)}
                  disabled={generatingFor === tx._id}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary-600 text-primary-700 hover:bg-primary-50 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {generatingFor === tx._id ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating drafts...</>
                  ) : (
                    <>Generate AI Reminder</>
                  )}
                </button>
                <button onClick={() => setPaymentModal(tx)} className="px-4 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors bg-emerald-50/20 font-medium whitespace-nowrap" title="Collect Payment">
                  Collect
                </button>
              </div>
            )}
            
          </div>
        ))}
      </div>

      {paymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Collect Payment</h3>
              <p className="text-slate-500 text-sm">
                Collecting <span className="font-bold text-slate-900">₹{paymentModal.amount}</span> from <span className="font-bold text-slate-900">{paymentModal.customerName || paymentModal.customerPhone}</span>
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => handleMarkPaid(paymentModal._id, 'CASH')}
                  className="py-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 font-bold rounded-xl transition-all"
                >
                  Cash
                </button>
                <button 
                  onClick={() => handleMarkPaid(paymentModal._id, 'UPI')}
                  className="py-3 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-800 font-bold rounded-xl transition-all"
                >
                  UPI
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => setPaymentModal(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {batchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Batch Notify Clients</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                You are about to automatically generate and send AI reminders to all {pending.filter(p => !p.reminderSent).length} customers with pending dues.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setScheduleType('now')}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${scheduleType === 'now' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => setScheduleType('custom')}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${scheduleType === 'custom' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    Schedule Later
                  </button>
                </div>

                {scheduleType === 'custom' && (
                  <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Time to Notify</label>
                    <input 
                      type="datetime-local" 
                      value={batchScheduleDate}
                      onChange={(e) => setBatchScheduleDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-slate-900 font-medium"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setBatchModalOpen(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBatchNotify}
                    disabled={isBatching}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all flex justify-center items-center gap-2"
                  >
                    {isBatching ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
