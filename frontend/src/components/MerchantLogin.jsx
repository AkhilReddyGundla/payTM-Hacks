import React, { useState } from 'react';
import { Store, Phone, ArrowRight, Loader2 } from 'lucide-react';
import aiImage from '../assets/merchant-ai-scene.png';

const MerchantLogin = ({ onLogin, isLoggingIn, onSwitchRole }) => {
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginName, loginPhone);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side: Visual / Brand */}
        <div className="md:w-5/12 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden text-white min-h-[300px] md:min-h-full">
          {/* Decorative Gradients */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <Store size={24} className="text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">Sales Copilot</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-[220px] mb-8 group perspective-1000">
            <div className="relative w-full max-w-[280px] aspect-square rounded-4xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/10 bg-white/5 cursor-pointer transform-style-3d group-hover:rotate-y-6 group-hover:-rotate-x-6 transition-transform duration-700">
              <img 
                src={aiImage} 
                alt="AI Merchant Technology" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/30 to-transparent opacity-40 mix-blend-overlay pointer-events-none"></div>
              
              {/* Floating Data Nodes */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white] animate-ping pointer-events-none" style={{ animationDuration: '3s' }}></div>
              <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_15px_#818cf8] animate-ping pointer-events-none" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
              <div className="absolute top-[40%] right-[30%] w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_15px_#d8b4fe] animate-ping pointer-events-none" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
              
              <div className="absolute inset-0 border-[2px] border-white/0 group-hover:border-indigo-400/40 transition-colors duration-500 rounded-4xl pointer-events-none z-30"></div>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Manage your store <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">intelligently.</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xs">
              Join thousands of merchants using AI to analyze sales, track dues, and offer targeted promotions.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Welcome back, Merchant</h3>
            <p className="text-slate-500 mb-8 text-sm">Enter your store details to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Store Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Store size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="E.g. Kirana General Store" 
                    value={loginName} 
                    onChange={e => setLoginName(e.target.value)} 
                    required 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit number" 
                    value={loginPhone} 
                    onChange={e => setLoginPhone(e.target.value)} 
                    required 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoggingIn || !loginName || !loginPhone} 
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Accessing Store...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Store Dashboard</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">Not a merchant?</p>
              <button 
                onClick={onSwitchRole} 
                className="mt-2 text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors hover:underline"
              >
                Switch to Customer View
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MerchantLogin;
