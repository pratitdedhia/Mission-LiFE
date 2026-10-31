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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#1f2125]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Actionable Resource Hub
            </span>
            <span className="text-xs font-mono text-zinc-500">GEDA Empanelled</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Green Directory & Schemes
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified renewable energy vendors, e-waste drop points, EV hubs, and government solar subsidies across Gujarat.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-[#16171b] border border-[#252830] rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'vendors' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Verified Vendors
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'schemes' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Policy & Schemes
          </button>
        </div>
      </div>

      {activeTab === 'vendors' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vendor, city, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#16171a] border border-[#26282e] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((c) => {
                const Icon = c.icon;
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-[#16171a] text-zinc-400 border border-[#26282e] hover:text-zinc-200'
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
                className="card-minimal p-5 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-zinc-100">{vendor.name}</h3>
                        {vendor.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" title="GEDA Verified" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400/90 font-medium mt-0.5 block">
                        {vendor.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-amber-300 text-xs font-semibold">
                      <span>★</span>
                      <span>{vendor.rating}</span>
                      <span className="text-[10px] text-zinc-500">({vendor.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="line-clamp-1">{vendor.address}</span>
                  </div>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {vendor.services.map((s, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-mono bg-[#1a1b20] border border-[#292c34] text-zinc-300 px-2 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Contact */}
                <div className="mt-4 pt-3 border-t border-[#1f2125] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.category === 'solar' ? (
                    <button
                      onClick={onNavigateToSolar}
                      className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 cursor-pointer transition-colors"
                    >
                      Solar Feasibility →
                    </button>
                  ) : (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors"
                    >
                      Contact
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
            <div key={scheme.id} className="card-minimal p-5 sm:p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    {scheme.authority}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100 mt-2">
                    {scheme.title}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 font-medium">
                    {scheme.tagline}
                  </p>
                </div>
                <a
                  href={scheme.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-colors self-start"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1f2125] text-xs">
                <div className="bg-[#17181c] p-3 rounded-lg border border-[#23252a]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Financial Incentive</span>
                  <p className="text-zinc-200 font-medium leading-relaxed">{scheme.subsidyDetails}</p>
                </div>
                <div className="bg-[#17181c] p-3 rounded-lg border border-[#23252a]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Eligibility Criteria</span>
                  <p className="text-zinc-300 leading-relaxed">{scheme.eligibility}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
