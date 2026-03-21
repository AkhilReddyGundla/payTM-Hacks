import { useState, useEffect } from 'react';
import api from '../api';
import { Loader2, Sparkles, TrendingUp, TrendingDown, Lightbulb, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PremiumDigest({ merchantId }) {
  const [digest, setDigest] = useState(null);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');

  const [digestTime, setDigestTime] = useState('21:00');
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get(`/merchants/${merchantId}`);
        if (data.digestTime) {
          setDigestTime(data.digestTime);
          setIsAutopilotEnabled(true);
        }
      } catch (e) {
        console.error('Failed to fetch merchant settings', e);
      }
    };
    fetchSettings();
  }, [merchantId]);

  const handleGenerateDigest = async () => {
    try {
      setIsGeneratingDigest(true);
      const { data } = await api.get(`/insights/daily-digest?merchantId=${merchantId}`);
      setDigest(data);
      toast.success('Daily digest generated successfully!');
    } catch (error) {
      toast.error('Failed to generate daily digest');
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  const handleScheduleDigest = async () => {
    if (!digest) return;
    try {
      setIsScheduling(true);
      const merchant = JSON.parse(localStorage.getItem('merchant') || '{}');
      const targetDate = scheduleType === 'custom' && scheduleDate ? new Date(scheduleDate).toISOString() : null;

      await api.post('/insights/schedule-digest', {
        merchantId,
        phone: merchant.phone,
        digestData: digest,
        scheduledFor: targetDate
      });
      toast.success(targetDate ? 'Hero Campaign Scheduled!' : 'Hero Campaign Launching Now!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule digest');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      const newTime = isAutopilotEnabled ? digestTime : null;
      await api.put(`/merchants/${merchantId}/settings`, { digestTime: newTime });
      toast.success(isAutopilotEnabled ? `Autopilot saved for ${newTime} every day!` : 'Autopilot disabled.');
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute -top-10 -right-10 p-4 opacity-10">
          <Sparkles size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/10">Premium Feature</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">AI Daily Store Digest</h2>
          <p className="text-indigo-100/80 max-w-md text-sm mb-6 leading-relaxed">
            Instantly analyze today's sales to discover your Hero product, Zero product, and actionable improvements for tomorrow.
          </p>

          {!digest ? (
            <button 
              onClick={handleGenerateDigest}
              disabled={isGeneratingDigest}
              className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
            >
              {isGeneratingDigest ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-indigo-600" />}
              Generate Today's Digest
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2 text-sm uppercase tracking-wider"><TrendingUp size={16} /> Hero Product</div>
                  <p className="text-sm font-medium leading-relaxed">{digest.heroProduct}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-2 text-rose-300 font-bold mb-2 text-sm uppercase tracking-wider"><TrendingDown size={16} /> Zero Product</div>
                  <p className="text-sm font-medium leading-relaxed">{digest.zeroProduct}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/30 p-5 rounded-2xl shadow-inner">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-2 text-sm uppercase tracking-wider"><Lightbulb size={16} /> Pro Tip for Tomorrow</div>
                <p className="text-sm font-medium leading-relaxed">{digest.improvementTip}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex justify-center items-center gap-2 text-sm"
                >
                  <Send size={16} />
                  Launch Hero Campaign
                </button>
                <button 
                  onClick={() => setDigest(null)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all text-sm flex justify-center items-center"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Autopilot Settings */}
      <div className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-3xl mb-8 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              🤖 Autopilot Settings
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md">
              Automatically blast the Hero Product AI campaign to your customers every single day at a customized time.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <input 
                type="checkbox" 
                checked={isAutopilotEnabled} 
                onChange={(e) => setIsAutopilotEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Enable</span>
            </div>
            
            <input 
              type="time" 
              value={digestTime}
              onChange={(e) => setDigestTime(e.target.value)}
              disabled={!isAutopilotEnabled}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 disabled:opacity-50"
            />

            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
            >
              {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Campaign Schedule</h3>
              <p className="text-center text-sm text-slate-500 mb-6">
                This will send the Digest to <strong>you</strong>, and launch a mass AI text campaign offering your <strong>Hero Product</strong> to all customers!
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setScheduleType('now')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${scheduleType === 'now' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    <Send className={scheduleType === 'now' ? 'text-indigo-600' : ''} />
                    <span className="font-semibold">Send Now</span>
                  </button>
                  <button 
                    onClick={() => setScheduleType('custom')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${scheduleType === 'custom' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    <Clock className={scheduleType === 'custom' ? 'text-indigo-600' : ''} />
                    <span className="font-semibold">Custom Time</span>
                  </button>
                </div>

                {scheduleType === 'custom' && (
                  <div className="pt-2 animate-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                disabled={isScheduling}
              >
                Cancel
              </button>
              <button 
                onClick={handleScheduleDigest}
                disabled={isScheduling || (scheduleType === 'custom' && !scheduleDate)}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isScheduling && <Loader2 size={18} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
