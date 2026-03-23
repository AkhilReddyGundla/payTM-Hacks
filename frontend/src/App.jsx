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
import LandingPage from './components/LandingPage';
import MerchantLogin from './components/MerchantLogin';
import api from './api';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [userRole, setUserRole] = useState(() => {
    if (localStorage.getItem('merchant')) return 'MERCHANT';
    if (localStorage.getItem('customerPhone')) return 'CUSTOMER';
    return null;
  }); // null shows the landing page
  
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

  const handleMerchantLogin = async (merchantName, merchantPhone) => {
    if (!merchantPhone || !merchantName) return;
    try {
      setIsLoggingIn(true);
      const res = await api.post('/merchants/register', { name: merchantName, phone: merchantPhone });
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

  // Landing Page
  if (!userRole) {
    return <LandingPage onSelectRole={setUserRole} />;
  }

  // Rendering Login Screens if needed
  if (userRole === 'MERCHANT' && !merchant) {
    return (
      <MerchantLogin 
        onLogin={handleMerchantLogin}
        isLoggingIn={isLoggingIn}
        onSwitchRole={() => setUserRole('CUSTOMER')} 
      />
    );
  }

  if (userRole === 'CUSTOMER' && !customerPhone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100/50 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">
              <CreditCard size={32} className="text-emerald-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 tracking-tight">Check Dues</h2>
          <p className="text-center text-slate-500 mb-8 max-w-xs mx-auto text-sm">Enter your phone number to check pending balances across stores.</p>
          <form onSubmit={handleCustomerLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter 10-digit number" 
                value={loginPhone} 
                onChange={e=>setLoginPhone(e.target.value)} 
                required 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" 
              />
            </div>
            <button type="submit" className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5">
              View My Dues
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-2">Are you a merchant?</p>
            <button onClick={() => setUserRole('MERCHANT')} className="text-emerald-600 text-sm font-semibold hover:text-emerald-800 transition-colors">Switch to Merchant Dashboard</button>
          </div>
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
          <div 
            className="flex items-center gap-2 text-primary-600 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => { 
              setMerchant(null); 
              localStorage.removeItem('merchant');
              setUserRole(null); 
            }}
          >
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
