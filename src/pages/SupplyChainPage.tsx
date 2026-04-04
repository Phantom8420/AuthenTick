import React from 'react';
import { motion } from 'motion/react';
import { Truck, Package, MapPin, ArrowRight, History as HistoryIcon, Search, Filter, ChevronRight } from 'lucide-react';

export default function SupplyChainPage() {
  const shipments = [
    { id: 'SHP-9281', from: 'Geneva Factory', to: 'Zurich Hub', status: 'In Transit', date: '2024-04-03', items: 120 },
    { id: 'SHP-8172', from: 'Zurich Hub', to: 'London Distribution', status: 'Delivered', date: '2024-04-01', items: 45 },
    { id: 'SHP-7261', from: 'London Distribution', to: 'Mayfair Retail', status: 'Processing', date: '2024-04-04', items: 12 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Supply Chain Dashboard</h1>
          <p className="text-slate-600">Track GS1 EPCIS events and inventory movement.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Package className="h-4 w-4" />
            New Shipment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Active Shipments', value: '24', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Items in Transit', value: '1,482', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Verified Locations', value: '12', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
            <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Shipments</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Shipment ID</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Items</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((shipment, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{shipment.id}</div>
                    <div className="text-[10px] font-mono text-slate-400">GS1-EPCIS-v2.0</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">{shipment.from}</span>
                      <ArrowRight className="h-3 w-3 text-slate-300" />
                      <span className="text-sm font-medium text-slate-600">{shipment.to}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      shipment.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                      shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-600">{shipment.items} units</td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-400">{shipment.date}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
          <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            View All Shipments
          </button>
        </div>
      </div>
    </div>
  );
}
