import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Navigation,
  FileText 
} from 'lucide-react';
import { GOVERNMENT_SCHEMES } from '../data/initialData';
import { BRANDING } from '../config/branding';
import { searchLocalityResources, getGoogleMapsNavigationUrl } from '../services/mapsService';

export default function GreenDirectory({ onNavigateToSolar }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('Ahmedabad');
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'schemes'
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapSourceMeta, setMapSourceMeta] = useState(null);

  const categories = [
    { id: 'all', label: 'All Providers', icon: Building2 },
    { id: 'solar', label: 'Rooftop Solar', icon: Sun },
    { id: 'ewaste', label: 'E-Waste Centers', icon: Cpu },
    { id: 'ev', label: 'EV Fast Charging', icon: Zap },
    { id: 'waste', label: 'Compost & Aerators', icon: Recycle }
  ];

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    searchLocalityResources(searchQuery || 'Gujarat', selectedCategory).then(res => {
      if (isCurrent) {
        setResources(res.totalResults);
        setMapSourceMeta(res);
        setLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              Actionable Resource Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Gujarat Empanelled Directory & Places API</span>
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
            Locality Directory
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
          {/* Privacy-Friendly Manual Locality Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Enter Gujarat city or locality (e.g. Navrangpura, Bodakdev, Gotri, Vesu, Palaj)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Quick Gujarat City Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["Ahmedabad", "Gandhinagar", "Surat", "Vadodara", "Rajkot"].map(city => (
                  <button
                    key={city}
                    onClick={() => setSearchQuery(city)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      searchQuery.toLowerCase() === city.toLowerCase()
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manual locality entry supported — device GPS is optional and not required.</span>
              </span>
              <span>Source: {mapSourceMeta?.source || "GEDA Verified Directory"}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Vendors & Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((item) => {
              const isVerified = item.isVerified;
              return (
                <div 
                  key={item.id} 
                  className={`human-card p-5 sm:p-6 flex flex-col justify-between border ${
                    isVerified 
                      ? 'border-emerald-200 dark:border-emerald-800/80' 
                      : 'border-amber-200 dark:border-amber-900/60'
                  }`}
                >
                  <div>
                    {/* Verification Status Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              {item.verificationLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Unverified Public Map Listing
                            </span>
                          )}
                        </div>
                        {item.empanelmentId && (
                          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                            Empanelment ID: {item.empanelmentId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex-shrink-0">
                        <span>★</span>
                        <span>{item.rating}</span>
                        <span className="text-[10px] text-slate-400">({item.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-2">{item.address}</span>
                    </div>

                    {/* Verification Disclaimer */}
                    <p className={`text-[11px] mt-2.5 p-2 rounded-lg leading-relaxed ${
                      isVerified
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
                        : 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40'
                    }`}>
                      {item.verificationDisclaimer}
                    </p>

                    {/* Services tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.services.map((s, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Navigation & Contact */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{item.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View on Google Maps Link */}
                      <a
                        href={getGoogleMapsNavigationUrl(item.address, item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3 text-blue-500" />
                        <span>Google Map</span>
                      </a>

                      {item.category === 'solar' && (
                        <button
                          onClick={onNavigateToSolar}
                          className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Calculate Solar →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                    {scheme.benefit}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-400 block">Eligible Beneficiaries</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg mt-0.5 inline-block">
                    {scheme.eligibility}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">How to Apply: </span>
                {scheme.howToApply}
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-mono">Official State Portal: {scheme.portal}</span>
                <a
                  href={`https://${scheme.portal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Visit National/State Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
