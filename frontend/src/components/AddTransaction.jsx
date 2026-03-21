import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Send, Loader2, Sparkles, CheckCircle2, ReceiptText, Store, Lightbulb, Mic } from 'lucide-react';

export default function AddTransaction({ merchantId, onTransactionAdded }) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestionWarning, setSuggestionWarning] = useState(null);
  const [partialData, setPartialData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [fixData, setFixData] = useState({ itemText: '', amount: '', customerName: '', customerPhone: '', status: 'PAID' });
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Please use Chrome.', { icon: '😢' });
      return;
    }

    if (isListening) {
      if (window._recognition) window._recognition.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Supports Hinglish/Indian accents very well

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak your transaction.', { icon: '🎤' });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast.error(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => setIsListening(false);

    window._recognition = recognition;
    recognition.start();
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsProcessing(true);
    setResult(null);
    setSuggestionWarning(null);

    try {
      const { data } = await api.post('/transactions/process', {
        text,
        merchantId
      });
      setResult(data);
      toast.success('Transaction parsed and saved!');
      setText('');
      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      if (error.response?.data?.isMissingDetails) {
        setSuggestionWarning(error.response.data.suggestion);
        setPartialData(error.response.data.parsedData);
        setMissingFields(error.response.data.missingFields);
        const p = error.response.data.parsedData;
        setFixData({
          itemText: p?.itemText && p.itemText.toLowerCase() !== text.toLowerCase() ? p.itemText : '',
          amount: p?.amount || '',
          customerName: (p?.customerName && p.customerName !== 'Unknown' && p.customerName !== 'Guest') ? p.customerName : '',
          customerPhone: (p?.customerPhone && p.customerPhone !== '9999999999') ? p.customerPhone : '',
          status: p?.status || 'PAID'
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to process transaction');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-2 shadow-inner">
          <Store size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Log a new sale naturally</h2>
        <p className="text-slate-500 text-lg max-w-sm mx-auto">Just type what happened, our AI will instantly log the transaction.</p>
      </div>

      {suggestionWarning && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-blue-900 animate-in fade-in zoom-in-95 duration-500 shadow-md mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight tracking-tight">AI Copilot Needs Clarification</p>
              <p className="font-medium text-blue-700 text-sm mt-0.5">Please fill in the blanks below or hover to edit what I found:</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-wrap items-center gap-x-2 gap-y-3 font-semibold text-slate-700 text-sm sm:text-base">
            <span className="text-slate-400">Sold</span>
            <input 
              value={fixData.itemText} 
              onChange={e => setFixData({...fixData, itemText: e.target.value})} 
              placeholder="[Item Name]" 
              className={`w-32 sm:w-40 px-3 py-1.5 transition-all outline-none rounded-lg border-2 ${!fixData.itemText ? 'border-amber-400 bg-amber-50 focus:border-blue-500 focus:bg-white text-amber-900 placeholder:text-amber-700/60' : 'border-transparent bg-slate-100 hover:border-blue-300 focus:border-blue-500 focus:bg-white text-blue-900'}`} 
            />
            <span className="text-slate-400">for Rs</span>
            <input 
              type="number" 
              value={fixData.amount} 
              onChange={e => setFixData({...fixData, amount: e.target.value})} 
              placeholder="[Price]" 
              className={`w-20 sm:w-24 px-3 py-1.5 transition-all outline-none rounded-lg border-2 ${!fixData.amount ? 'border-amber-400 bg-amber-50 focus:border-blue-500 focus:bg-white text-amber-900 placeholder:text-amber-700/60' : 'border-transparent bg-slate-100 hover:border-blue-300 focus:border-blue-500 focus:bg-white text-blue-900'}`} 
            />
            <span className="text-slate-400 pl-1">to</span>
            <input 
              value={fixData.customerName} 
              onChange={e => setFixData({...fixData, customerName: e.target.value})} 
              placeholder="[Name]" 
              className={`w-24 sm:w-32 px-3 py-1.5 transition-all outline-none rounded-lg border-2 ${!fixData.customerName ? 'border-amber-400 bg-amber-50 focus:border-blue-500 focus:bg-white text-amber-900 placeholder:text-amber-700/60' : 'border-transparent bg-slate-100 hover:border-blue-300 focus:border-blue-500 focus:bg-white text-blue-900'}`} 
            />
            <input 
              value={fixData.customerPhone} 
              onChange={e => setFixData({...fixData, customerPhone: e.target.value})} 
              placeholder="[10-digit Phone]" 
              className={`w-36 sm:w-44 px-3 py-1.5 transition-all outline-none rounded-lg border-2 ${!fixData.customerPhone ? 'border-amber-400 bg-amber-50 focus:border-blue-500 focus:bg-white text-amber-900 placeholder:text-amber-700/60' : 'border-transparent bg-slate-100 hover:border-blue-300 focus:border-blue-500 focus:bg-white text-blue-900'}`} 
            />
            <span className="text-slate-400 mx-1">-</span>
            <select 
              value={fixData.status} 
              onChange={e => setFixData({...fixData, status: e.target.value})}
              className="px-3 py-1.5 transition-all outline-none rounded-lg border-2 border-transparent bg-slate-100 hover:border-blue-300 focus:border-blue-500 focus:bg-white text-blue-900 font-bold cursor-pointer"
            >
              <option value="PAID">Paid in Full</option>
              <option value="PENDING">Pending Payment</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5">
            <button 
              onClick={() => setSuggestionWarning(null)} 
              className="px-5 py-2.5 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                const finalSentence = `Sold ${fixData.itemText} for Rs ${fixData.amount} to ${fixData.customerName} ${fixData.customerPhone} - status was ${fixData.status}`;
                setText(finalSentence);
                setSuggestionWarning(null);
              }} 
              disabled={!fixData.itemText || !fixData.amount || !fixData.customerName || !fixData.customerPhone}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Confirm Update <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleProcess} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-end gap-2 bg-white ring-1 ring-slate-200 p-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary-600 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g., "5 chai to Ravi, he will pay 50 rupees tomorrow"'
            className="w-full bg-transparent p-4 pr-[120px] min-h-[140px] resize-none outline-none text-slate-800 placeholder-slate-400 font-medium text-lg leading-relaxed"
            disabled={isProcessing}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center h-12 w-12 ${isListening ? 'bg-red-500 animate-pulse text-white hover:bg-red-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              title="Speak Transaction"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={isProcessing || !text.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center h-12 w-12"
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="relative -ml-1" />}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider w-full text-center mb-1">Try saying</span>
        <button onClick={() => setText("sold 2 samosas for 30")} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">"sold 2 samosas for 30"</button>
        <button onClick={() => setText("10 tea anil pending")} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">"10 tea anil pending"</button>
      </div>

      {result && (
        <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-400 mt-8">
          <div className="bg-emerald-500 p-4 flex items-center justify-center gap-3 text-white">
            <CheckCircle2 size={24} className="text-emerald-100" />
            <h3 className="font-bold text-lg">Transaction Saved</h3>
          </div>
          
          <div className="p-6 md:p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjFmNWY5Ii8+Cjwvc3ZnPg==')] opacity-50 -mt-2"></div>

            {result.creditWarning && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3 shadow-inner">
                <span className="text-amber-500 text-xl leading-none">⚠️</span>
                {result.creditWarning}
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2 pb-4 border-b border-dashed border-slate-200">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-4xl font-extrabold text-slate-800 tracking-tight">₹{result.transaction?.amount}</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Customer</p>
                <p className="font-semibold text-slate-800 text-base">{result.customer?.name || 'Guest'}</p>
                <p className="text-slate-500 text-sm font-mono">{result.customer?.phone}</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  result.transaction?.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {result.transaction?.status}
                </span>
              </div>

              <div className="col-span-2 pt-4 border-t border-dashed border-slate-200">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Item Purchased</p>
                <p className="font-semibold text-slate-700 break-words">{result.transaction?.itemText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
