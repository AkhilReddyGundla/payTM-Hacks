import React from 'react';
import { Store, CreditCard, Sparkles, TrendingUp, Gift, ChevronRight } from 'lucide-react';

const LandingPage = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-l from-emerald-500 to-teal-500 blur-[80px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="animate-pulse" />
            <span >Introducing AI Sales Copilot 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Power your retail store with <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">Intelligent AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Transform offline sales, automate credit tracking, and deliver hyper-personalized offers to your customers—all powered by cutting-edge AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onSelectRole('MERCHANT')}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 relative"
            >
              <div className="flex items-center justify-center gap-2">
                <Store size={20} className="text-indigo-600" />
                <span>Enter as Merchant</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-slate-400" />
              </div>
            </button>
            <button 
              onClick={() => onSelectRole('CUSTOMER')}
              className="group w-full sm:w-auto px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all hover:border-slate-600"
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={20} className="text-emerald-400" />
                <span>Check My Dues</span>
              </div>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
          <FeatureCard 
            icon={<TrendingUp size={24} className="text-indigo-400" />}
            title="Smart Transactions"
            description="Log sales in seconds. Let the AI parse voice or text inputs instantly."
            gradient="from-indigo-500/10 to-transparent"
            border="border-indigo-500/20"
          />
          <FeatureCard 
            icon={<Gift size={24} className="text-pink-400" />}
            title="Dynamic Offers"
            description="Generate personalized promotions based on past purchase history."
            gradient="from-pink-500/10 to-transparent"
            border="border-pink-500/20"
          />
          <FeatureCard 
            icon={<CreditCard size={24} className="text-emerald-400" />}
            title="Dues Management"
            description="Automate payment reminders and easily track pending customer credits."
            gradient="from-emerald-500/10 to-transparent"
            border="border-emerald-500/20"
          />
        </div>

      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, gradient, border }) => (
  <div className={`p-6 rounded-3xl bg-slate-800/40 backdrop-blur-md border ${border} relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
    <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-6 shadow-inner border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  </div>
);

export default LandingPage;
