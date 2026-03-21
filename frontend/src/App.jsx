import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  Store, 
  Clock, 
  Gift, 
  CreditCard,
  PlusCircle,
  Sparkles
} from 'lucide-react';

import AddTransaction from './components/AddTransaction';
import TransactionsList from './components/TransactionsList';
import PendingCredits from './components/PendingCredits';
import SmartOffers from './components/SmartOffers';
import PremiumDigest from './components/PremiumDigest';
import CustomerDashboard from './components/CustomerDashboard';
import api from './api';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [userRole, setUserRole] = useState('MERCHANT'); // 'MERCHANT' | 'CUSTOMER'
  
  // Auth state
  const [merchant, setMerchant] = useState(() => {
    const saved = localStorage.getItem('merchant');
    return saved ? JSON.parse(saved) : null;
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    return localStorage.getItem('customerPhone') || '';
  });

  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const tabs = [
    { id: 'add', label: 'New Sale', icon: PlusCircle },
    { id: 'transactions', label: 'Transactions', icon: Store },
    { id: 'credits', label: 'Pending Dues', icon: CreditCard },
    { id: 'offers', label: 'Smart Offers', icon: Gift },
    { id: 'premium', label: 'AI Digest', icon: Sparkles },
  ];

  const handleMerchantLogin = async (e) => {
    e.preventDefault();
    if (!loginPhone || !loginName) return;
    try {
      setIsLoggingIn(true);
      const res = await api.post('/merchants/register', { name: loginName, phone: loginPhone });
      setMerchant(res.data);
      localStorage.setItem('merchant', JSON.stringify(res.data));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCustomerLogin = (e) => {
    e.preventDefault();
    if (!loginPhone) return;
    setCustomerPhone(loginPhone);
    localStorage.setItem('customerPhone', loginPhone);
  };

  const currentMerchantId = merchant ? merchant._id : '';

  // Rendering Login Screens if needed
  if (userRole === 'MERCHANT' && !merchant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
          <div className="flex justify-center mb-6 text-primary-600"><Store size={48} /></div>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Merchant Login</h2>
          <form onSubmit={handleMerchantLogin} className="space-y-4">
            <input type="text" placeholder="Store Name" value={loginName} onChange={e=>setLoginName(e.target.value)} required className="w-full p-3 border rounded-xl" />
            <input type="tel" placeholder="Phone Number" value={loginPhone} onChange={e=>setLoginPhone(e.target.value)} required className="w-full p-3 border rounded-xl" />
            <button type="submit" disabled={isLoggingIn} className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {isLoggingIn ? 'Entering...' : 'Enter Store'}
            </button>
          </form>
          <button onClick={() => setUserRole('CUSTOMER')} className="mt-4 w-full text-slate-500 text-sm font-medium hover:text-slate-800">Switch to Customer View</button>
        </div>
      </div>
    );
  }

  if (userRole === 'CUSTOMER' && !customerPhone) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
          <div className="flex justify-center mb-6 text-indigo-500"><CreditCard size={48} /></div>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Customer Login</h2>
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <input type="tel" placeholder="Your Phone Number" value={loginPhone} onChange={e=>setLoginPhone(e.target.value)} required className="w-full p-3 border rounded-xl" />
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">View My Dues</button>
          </form>
          <button onClick={() => setUserRole('MERCHANT')} className="mt-4 w-full text-slate-500 text-sm font-medium hover:text-slate-800">Switch to Merchant View</button>
        </div>
      </div>
    );
  }

  // Customer Dashboard Flow
  if (userRole === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-50 pt-8">
        <div className="max-w-5xl mx-auto px-4 mb-4 flex justify-end">
          <button onClick={() => setUserRole('MERCHANT')} className="text-sm font-medium bg-white border px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50">Switch to Merchant View</button>
        </div>
        <CustomerDashboard customerPhone={customerPhone} onLogout={() => { setCustomerPhone(''); localStorage.removeItem('customerPhone'); }} />
      </div>
    );
  }

  // Merchant View
  return (
    <div className="min-h-screen bg-slate-50 relative pb-20 md:pb-0">
      <Toaster position="top-right" />
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <Store size={24} className="stroke-[2.5]" />
            <h1 className="font-bold text-xl tracking-tight text-slate-900">AI Sales Copilot</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setUserRole('CUSTOMER')} 
              className="text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-200 transition-colors mr-2 border border-slate-200"
            >
              Demo: Switch Customer
            </button>
            <button 
              onClick={() => { setMerchant(null); localStorage.removeItem('merchant'); }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {merchant?.name || 'Store'}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {merchant?.name?.charAt(0) || 'M'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isPremium = tab.id === 'premium';
            const isActive = activeTab === tab.id;
            
            let buttonClass;
            if (isPremium) {
              buttonClass = isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/40' 
                : 'text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 ring-1 ring-indigo-200/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse';
            } else {
              buttonClass = isActive 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass}`}
              >
                <Icon size={16} className={isPremium ? 'text-amber-400 fill-amber-300' : ''} />
                <span className={isPremium && !isActive ? 'font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600' : ''}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          <div className="p-6 md:p-8 h-full">
            {activeTab === 'add' && <AddTransaction merchantId={currentMerchantId} onTransactionAdded={() => setActiveTab('transactions')} />}
            {activeTab === 'transactions' && <TransactionsList merchantId={currentMerchantId} />}
            {activeTab === 'credits' && <PendingCredits merchantId={currentMerchantId} />}
            {activeTab === 'offers' && <SmartOffers merchantId={currentMerchantId} />}
            {activeTab === 'premium' && <PremiumDigest merchantId={currentMerchantId} />}
          </div>
        </div>
        
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-10 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isPremium = tab.id === 'premium';
            
            let btnClass = isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600';
            if (isPremium) btnClass = isActive ? 'text-indigo-600' : 'text-indigo-500';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${btnClass} ${isPremium && !isActive ? 'animate-pulse' : ''}`}
              >
                {isPremium && !isActive && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] w-6 h-6 bg-indigo-500/30 blur-md rounded-full"></div>}
                <Icon size={20} className={`relative z-10 ${isActive ? 'stroke-[2.5]' : ''} ${isPremium ? 'text-amber-400 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}`} />
                <span className={`text-[10px] font-medium leading-none relative z-10 ${isPremium ? 'font-bold' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
    </div>
  );
}

export default App;
