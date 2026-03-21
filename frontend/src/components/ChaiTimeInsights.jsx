import { useState, useEffect } from 'react';
import api from '../api';
import { Loader2, Clock, Coffee, BellRing, Sparkles, TrendingUp, TrendingDown, Lightbulb, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChaiTimeInsights({ merchantId }) {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [merchantId]);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/insights/chai-time?merchantId=${merchantId}`);
      setInsights(data);
    } catch (error) {
      toast.error('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotify = () => {
    toast.success('Notifications enabled for rush hours!');
  };

  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${ampm}`;
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 size={32} className="animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-2">
          <Coffee size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Rush Hour Insights</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          We analyzed your sales data to find when you're busiest. Engage customers right before your rush hours!
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500">Not enough data to generate insights yet. Keep logging sales!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={insight.hour} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4 overflow-hidden relative">
              
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-400 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                  Peak Time
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-xl font-bold ${index === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200 ring-offset-2' : 'bg-slate-100 text-slate-700'}`}>
                  <span className="text-lg leading-none">{formatHour(insight.hour).split(' ')[0]}</span>
                  <span className="text-[10px] mt-0.5 uppercase">{formatHour(insight.hour).split(' ')[1]}</span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900">{insight.count} sales typically</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={insight.popularString}>
                    Popular: {insight.popularString}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleNotify}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <BellRing size={16} className="text-primary-500" />
                <span className="hidden sm:inline">Set Alert</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
