import { useState, useEffect } from 'react';
import api from '../api';
import { Sparkles, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { formatRelative } from 'date-fns';

export default function InboxDigest({ merchantId }) {
  const [digest, setDigest] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data } = await api.get(`/insights/latest-digest?merchantId=${merchantId}`);
        if (data) setDigest(data);
      } catch (e) {
        console.error('Failed to fetch digest inbox', e);
      }
    };
    fetchLatest();
  }, [merchantId]);

  if (!digest) return null;

  return (
    <div className="mb-12 pb-8 border-b-2 border-slate-100 border-dashed animate-in slide-in-from-top-4 fade-in duration-700">
      <div className="text-center mb-6">
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-4 py-1.5 rounded-full shadow-sm">
          New AI Digest Arrived!
        </span>
        <p className="text-xs font-semibold text-slate-400 mt-3">Received {formatRelative(new Date(digest.sentAt), new Date())}</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 p-4 opacity-10">
          <Sparkles size={180} />
        </div>
        
        <div className="relative z-10 space-y-4">
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
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-2 text-sm uppercase tracking-wider"><Lightbulb size={16} /> Pro Tip</div>
            <p className="text-sm font-medium leading-relaxed">{digest.improvementTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
