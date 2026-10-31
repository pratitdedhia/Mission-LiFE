import React, { useState } from 'react';
import { 
  Building2, 
  Sun, 
  Cpu, 
  Zap, 
  Recycle, 
  Phone, 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  Search,
  Filter,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { VENDORS_DIRECTORY, GOVERNMENT_SCHEMES } from '../data/initialData';
import { BRANDING } from '../config/branding';

export default function GreenDirectory({ onNavigateToSolar }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'schemes'

  const categories = [
    { id: 'all', label: 'All Providers', icon: Building2 },
    { id: 'solar', label: 'Rooftop Solar', icon: Sun },
    { id: 'ewaste', label: 'E-Waste Centers', icon: Cpu },
    { id: 'ev', label: 'EV Fast Charging', icon: Zap },
    { id: 'waste', label: 'Compost & Aerators', icon: Recycle }
  ];

  const filteredVendors = VENDORS_DIRECTORY.filter(vendor => {
    const matchesCat = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              Actionable Resource Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Gujarat Empanelled Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            Green Directory & Renewable Schemes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Empanelled rooftop solar installers, authorized e-waste collection points, EV hubs, and government subsidy details across Gujarat.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'vendors' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Verified Vendors
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'schemes' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Government Policies
          </button>
        </div>
      </div>

      {activeTab === 'vendors' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search vendor, city, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((c) => {
                const Icon = c.icon;
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => (
              <div 
                key={vendor.id} 
                className="human-card p-5 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{vendor.name}</h3>
                        {vendor.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" title="GEDA Empanelled" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {vendor.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-xs font-bold">
                      <span>★</span>
                      <span>{vendor.rating}</span>
                      <span className="text-[10px] text-slate-400">({vendor.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-1">{vendor.address}</span>
                  </div>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {vendor.services.map((s, idx) => (
                      <span 
                        key={idx} 
                        className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Contact */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.category === 'solar' ? (
                    <button
                      onClick={onNavigateToSolar}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
                    >
                      Solar Feasibility →
                    </button>
                  ) : (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Call Provider
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'schemes' && (
        <div className="space-y-4">
          {GOVERNMENT_SCHEMES.map((scheme) => (
            <div key={scheme.id} className="human-card p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {scheme.authority}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
                    {scheme.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                    {scheme.tagline}
                  </p>
                </div>
                <a
                  href={scheme.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all self-start"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase block mb-1">Financial Incentive</span>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{scheme.subsidyDetails}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase block mb-1">Eligibility Criteria</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{scheme.eligibility}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
