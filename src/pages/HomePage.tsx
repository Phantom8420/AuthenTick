import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, QrCode, Factory, Truck, Store, ChevronRight, CheckCircle2, History as HistoryIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Next-Gen Anti-Counterfeit
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
              Every Product Has a <span className="text-indigo-600">Digital Twin.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              AuthenTick uses blockchain and ZK-privacy to track ownership and verify authenticity across the entire supply chain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/verify" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                <QrCode className="h-5 w-5" />
                Verify Product
              </Link>
              <Link 
                to="/manufacturer" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Manufacturer Portal
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="relative h-full w-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <Shield className="h-12 w-12 opacity-80" />
                  <div className="text-right">
                    <div className="text-xs opacity-60 uppercase tracking-widest font-bold">Blockchain ID</div>
                    <div className="font-mono text-sm">0x8f2...e3a1</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                    <div className="h-10 w-10 rounded-full bg-green-400 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Authenticity Verified</div>
                      <div className="text-xs opacity-70">GS1 EPCIS Standard Compliant</div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="text-xs opacity-60 mb-2">Current Owner</div>
                    <div className="font-mono text-lg truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Factory className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Minted by</div>
                <div className="text-[10px] text-slate-500">Rolex SA (GLN 7612345)</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">A Unified Ecosystem</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            AuthenTick connects every stakeholder in the supply chain through a shared, immutable ledger.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Factory, title: 'Manufacturers', desc: 'Mint digital twins and generate secure QR codes.', color: 'bg-blue-50 text-blue-600' },
            { icon: Truck, title: 'Distributors', desc: 'Verify and record transit events via GS1 EPCIS.', color: 'bg-amber-50 text-amber-600' },
            { icon: Store, title: 'Retailers', desc: 'Securely receive and sell authenticated inventory.', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Shield, title: 'Consumers', desc: 'Verify authenticity and claim legal ownership.', color: 'bg-indigo-50 text-indigo-600' },
          ].map((role, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-14 w-14 rounded-2xl ${role.color} flex items-center justify-center mb-6`}>
                <role.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{role.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 leading-tight">Privacy-First <br />Ownership Tracking</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-indigo-400 font-bold">01</span>
                </div>
                <div>
                  <h4 className="font-bold mb-2">ZK-SNARK Privacy</h4>
                  <p className="text-slate-400 text-sm">Prove you own a product without revealing your identity on the public blockchain.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-indigo-400 font-bold">02</span>
                </div>
                <div>
                  <h4 className="font-bold mb-2">GS1 EPCIS Compliance</h4>
                  <p className="text-slate-400 text-sm">Seamlessly integrate with existing ERP systems using global supply chain standards.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-indigo-400 font-bold">03</span>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Polygon L2 Scalability</h4>
                  <p className="text-slate-400 text-sm">High-throughput, low-cost transactions capable of handling 2000+ TPS via batching.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="text-lg font-bold">Transaction Ledger</div>
              <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">Live</div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center">
                      <HistoryIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Ownership Transfer</div>
                      <div className="text-[10px] text-slate-500">2 mins ago</div>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-indigo-400">0x4a...9b2</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
