import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Loader2, Users, UserMinus, Sparkles, Send } from 'lucide-react';

export default function SmartOffers({ merchantId }) {
  const [activeTab, setActiveTab] = useState('regulars'); // regulars or inactive
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [generatedOffers, setGeneratedOffers] = useState({});
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState('now');
  const [batchScheduleDate, setBatchScheduleDate] = useState('');
  const [isBatching, setIsBatching] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [merchantId, activeTab]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/customers/${activeTab}?merchantId=${merchantId}`);
      setCustomers(data);
    } catch (error) {
      toast.error(`Failed to load ${activeTab} customers`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOffer = async (customer) => {
    const isInactive = activeTab === 'inactive';
    const phone = customer.phone || customer._id; // _id is phone for aggregated regulars

    try {
      setGeneratingFor(phone);
      const { data } = await api.post('/offers/generate', {
        merchantId,
        customerPhone: phone,
        isInactive
      });
      setGeneratedOffers(prev => ({ ...prev, [phone]: data.messageText }));
      toast.success('Offer generated successfully!');
    } catch (error) {
      toast.error('Failed to generate offer');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSendOffer = async (phone) => {
    try {
      await api.post('/reminders/send', {
        merchantId,
        customerPhone: phone,
        messageText: generatedOffers[phone]
      });
      toast.success('Offer sent!');
      setGeneratedOffers(prev => {
        const copy = { ...prev };
        delete copy[phone];
        return copy;
      });
    } catch (error) {
      toast.error('Failed to send offer');
    }
  };

  const handleScheduleOffer = async (phone) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

      await api.post('/reminders/sendOffer', {
        merchantId,
        customerPhone: phone,
        messageText: generatedOffers[phone],
        scheduledFor: tomorrow.toISOString()
      });
      toast.success('Offer scheduled for 9 AM tomorrow!');
      setGeneratedOffers(prev => {
        const copy = { ...prev };
        delete copy[phone];
        return copy;
      });
    } catch (error) {
      toast.error('Failed to schedule offer');
    }
  };

  const handleBatchSchedule = async () => {
    const loyalCustomers = customers.filter(c => c.totalPending === 0);
    if (loyalCustomers.length === 0) {
      toast.error('No regular customers with zero dues found.');
      return;
    }
    
    try {
      setIsBatching(true);
      const targetDate = scheduleType === 'custom' && batchScheduleDate ? new Date(batchScheduleDate).toISOString() : null;

      await api.post('/offers/batchSchedule', { 
        merchantId, 
        customers: loyalCustomers,
        scheduledFor: targetDate
      });
      toast.success(`Batch scheduling started for ${loyalCustomers.length} loyal customers!`);
      setBatchModalOpen(false);
      setBatchScheduleDate('');
    } catch (error) {
      toast.error('Failed to start batch schedule');
    } finally {
      setIsBatching(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="text-primary-500" size={24} />
          Smart Offers
        </h2>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('regulars')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'regulars' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Users size={16} /> Regulars
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'inactive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <UserMinus size={16} /> Inactive (1h+)
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 p-4 rounded-xl text-primary-900 text-sm flex gap-3">
        <div className="bg-primary-100 text-primary-600 p-2 rounded-lg h-fit">
          <Sparkles size={16} />
        </div>
        <p>
          {activeTab === 'regulars'
            ? "These customers buy from you often. Send them a VIP offer to increase loyalty and ticket size."
            : "These customers haven't visited in over an hour. Send them a small discount to win them back."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 size={32} className="animate-spin text-primary-600" /></div>
      ) : customers.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No {activeTab} customers found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {activeTab === 'regulars'
              ? "Start taking orders to build your loyal customer base! Once a customer makes 2 or more purchases, they will appear here."
              : "Customers who haven't visited in over an hour will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'regulars' && (
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setBatchModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
              >
                <Sparkles size={16} />
                Batch VIP Offers (Zero Dues)
              </button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {customers.map((c, i) => {
              const phone = c.phone || c._id;
              const name = c.name || 'Guest';
              const isLoyal = activeTab === 'regulars' && c.totalPending === 0;

              return (
                <div key={phone + i} className={`bg-white border p-5 rounded-2xl shadow-sm transition-all text-sm ${isLoyal ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{name}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {activeTab === 'regulars' && c.count && (
                        <div className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          {c.count} visits
                        </div>
                      )}
                      {activeTab === 'regulars' && (
                        <div className={`text-xs font-bold px-2 py-1 rounded ${c.totalPending === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.totalPending === 0 ? 'No Dues' : `₹${c.totalPending} Dues`}
                        </div>
                      )}
                    </div>
                  </div>

                  {generatedOffers[phone] ? (
                    <div className="space-y-3 mt-3">
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 text-sm animate-in zoom-in-95">
                        {generatedOffers[phone]}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendOffer(phone)}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors text-xs"
                        >
                          <Send size={16} /> Send Now
                        </button>
                        <button
                          onClick={() => handleScheduleOffer(phone)}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-2 rounded-lg font-medium transition-colors text-xs"
                        >
                          Schedule (Tmrw)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateOffer(c)}
                      disabled={generatingFor === phone}
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {generatingFor === phone ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-indigo-500" />}
                      Compose AI {activeTab === 'regulars' ? 'VIP Offer' : 'Win-back Offer'}
                    </button>
                  )}
                </div>
              );
          })}
        </div>
      </div>
      )}

      {batchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Batch Notify VIPs</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Generate and send AI VIP offers to all {customers.filter(c => c.totalPending === 0).length} loyal zero-due customers.
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
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${scheduleType === 'custom' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
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
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 font-medium"
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
                    onClick={handleBatchSchedule}
                    disabled={isBatching}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all flex justify-center items-center gap-2"
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
