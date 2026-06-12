import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, BarChart3, Leaf, Cpu, Star, Download, PlusCircle, X, Check,
  Activity, Sun, Battery, AlertTriangle, Shield, Eye, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { db, EnterpriseSite } from '@/lib/dashboardStore';
import { ENERGY_DATA } from '@/constants';

export default function EnterpriseDashboard({ view }: { view: string }) {
  const navigate = useNavigate();

  // Shared state
  const [sites, setSites] = useState<EnterpriseSite[]>([]);
  const [offlineSites, setOfflineSites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('solarphase_enterprise_offline_sites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Local forms
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: '', generation: '120', consumption: '110', co2: '55' });

  const syncData = () => {
    setSites(db.getSites());
    try {
      const stored = localStorage.getItem('solarphase_enterprise_offline_sites');
      setOfflineSites(stored ? JSON.parse(stored) : []);
    } catch {}
  };

  useEffect(() => {
    syncData();
    window.addEventListener('solarphase_data_updated', syncData);
    return () => window.removeEventListener('solarphase_data_updated', syncData);
  }, [view]);

  // Add a new site location
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm.name || !siteForm.generation || !siteForm.consumption) {
      toast.error('Please fill in all site fields.');
      return;
    }

    const newSite = db.addSite({
      name: siteForm.name,
      generation: parseInt(siteForm.generation),
      consumption: parseInt(siteForm.consumption),
      co2: parseInt(siteForm.co2),
    });

    syncData();
    setShowAddSiteModal(false);
    setSiteForm({ name: '', generation: '120', consumption: '110', co2: '55' });
    toast.success(`Facility site ${newSite.name} registered. Redirecting to performance logs...`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
    
    // Guided redirect
    setTimeout(() => {
      navigate('/dashboard/performance');
    }, 500);
  };

  // Toggle optimization on site
  const handleToggleOptimize = (id: number) => {
    const updated = sites.map(s => {
      if (s.id === id) {
        const list = s.appliedOptimizations || [];
        const active = list.includes('AI-Load-Shift');
        const nextList = active ? [] : ['AI-Load-Shift'];
        return {
          ...s,
          appliedOptimizations: nextList
        };
      }
      return s;
    });

    db.saveSites(updated);
    setSites(updated);
    toast.success('Facility automation controllers synchronized.');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Download ESG corporate report
  const handleDownloadESG = () => {
    toast.info('Analyzing corporate emissions profiles...');
    setTimeout(() => {
      const genTotal = processedSites.reduce((acc, s) => acc + s.generation, 0);
      const consTotal = processedSites.reduce((acc, s) => acc + s.consumption, 0);
      const co2Total = processedSites.reduce((acc, s) => acc + s.co2, 0);

      const esgContent = `SOLARPHASE ESG CORPORATE SUSTAINABILITY REPORT\n` +
        `==================================================\n` +
        `Reporting Period: Q2 2026 Audit\n` +
        `Aggregated Multi-Site Summary:\n` +
        `--------------------------------------------------\n` +
        `- Sites Configured: ${processedSites.length} Active Facilities\n` +
        `- Total Solar Generation: ${genTotal.toLocaleString()} kWh/day\n` +
        `- Total Energy Consumption: ${consTotal.toLocaleString()} kWh/day\n` +
        `- Total CO2 Emissions Offset: ${co2Total.toLocaleString()} kg/day\n` +
        `- Renewable Portfolio Standard (RPS): ${Math.round((genTotal / consTotal) * 100)}%\n` +
        `- Corporate ESG Compliance Rating: A+ (Excellent)\n` +
        `==================================================\n` +
        `Certified Environmental Ledger File. Transmitted via TLS.`;

      const element = document.createElement("a");
      const file = new Blob([esgContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `SolarPhase_ESG_Report_Q2_2026.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Corporate ESG report generated and downloaded.');
    }, 800);
  };

  // Connectivity Outage Simulator
  const simulateSiteOutage = () => {
    if (sites.length === 0) return;
    const availableToCrash = sites.filter(s => !offlineSites.includes(s.name.toLowerCase()));
    if (availableToCrash.length === 0) {
      toast.info('All facilities are already reporting communication loss.');
      return;
    }
    
    const targetSite = availableToCrash[Math.floor(Math.random() * availableToCrash.length)].name.toLowerCase();
    const updated = [...offlineSites, targetSite];
    setOfflineSites(updated);
    localStorage.setItem('solarphase_enterprise_offline_sites', JSON.stringify(updated));
    toast.error(`Grid Warning: Communication outage registered at "${targetSite.toUpperCase()}".`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  const handleReconnectSite = (name: string) => {
    const updated = offlineSites.filter(s => s !== name.toLowerCase());
    setOfflineSites(updated);
    localStorage.setItem('solarphase_enterprise_offline_sites', JSON.stringify(updated));
    toast.success(`Grid Alert: Restored connection to facility "${name.toUpperCase()}".`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  const handleForceReconnectAll = () => {
    setOfflineSites([]);
    localStorage.setItem('solarphase_enterprise_offline_sites', JSON.stringify([]));
    toast.success('Emulating total corporate grid telemetry reconnect...');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Dynamic calculations based on offline status and applied AI optimizations
  const processedSites = sites.map(s => {
    const isOffline = offlineSites.includes(s.name.toLowerCase());
    const isOptimized = s.appliedOptimizations?.includes('AI-Load-Shift');

    if (isOffline) {
      return {
        ...s,
        status: 'Offline' as const,
        generation: 0,
        co2: 0,
        consumption: Math.round(s.consumption * 0.35) // base facility survival draw
      };
    }

    if (isOptimized) {
      return {
        ...s,
        status: 'Online' as const,
        generation: s.generation,
        consumption: Math.round(s.consumption * 0.85), // 15% grid draw drop
        co2: Math.round(s.co2 * 1.1) // 10% higher carbon offset efficacy
      };
    }

    return {
      ...s,
      status: 'Online' as const
    };
  });

  const totalGeneration = processedSites.reduce((acc, s) => acc + s.generation, 0);
  const totalConsumption = processedSites.reduce((acc, s) => acc + s.consumption, 0);
  const totalCO2Saved = processedSites.reduce((acc, s) => acc + s.co2, 0);
  const netGridDraw = Math.max(0, totalConsumption - totalGeneration);
  const averageRPS = totalConsumption > 0 ? Math.round((totalGeneration / totalConsumption) * 100) : 0;
  
  // Compliance grades
  const activeOptimizationsCount = sites.filter(s => s.appliedOptimizations?.includes('AI-Load-Shift')).length;
  const esgGrade = activeOptimizationsCount >= 2 ? 'A+ Class' : activeOptimizationsCount === 1 ? 'A Class' : 'B- Class';

  // 1. VIEW: MONITOR SITES
  if (view === 'sites') return (
    <div className="space-y-5">
      {offlineSites.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Critical Grid Warning: Communication failure registered.</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lost remote communications link to: <span className="font-bold uppercase text-foreground">{offlineSites.join(', ')}</span>. Output registering 0 kWh.
            </p>
          </div>
          <button
            onClick={handleForceReconnectAll}
            className="px-3 py-1.5 bg-destructive text-white font-semibold rounded-lg text-xs hover:bg-destructive/90 transition-colors shadow-sm"
          >
            Reconnect All Facilities
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-lg">Multi-Site Facility Registry</h2>
          <p className="text-xs text-muted-foreground">Monitor real-time energy imports, harvest yields, and connectivity statuses.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={simulateSiteOutage}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Site Outage
          </button>
          <button
            onClick={() => setShowAddSiteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" /> Commission New Facility
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {processedSites.map(site => {
          const optimized = site.appliedOptimizations?.includes('AI-Load-Shift');
          const isOffline = site.status === 'Offline';
          return (
            <div key={site.id} className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
              isOffline ? 'border-destructive/30 bg-destructive/5' : optimized ? 'border-accent/30 bg-accent/5' : 'border-border'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOffline ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-foreground text-sm">{site.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOffline ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : 'bg-accent/10 text-accent border-accent/20'
                  }`}>
                    {site.status}
                  </span>
                </div>
                <div className="space-y-3.5 text-xs text-foreground">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Generation Yield</span>
                    <span className={`font-bold ${isOffline ? 'text-muted-foreground' : 'text-primary'}`}>{site.generation} kWh</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Grid Consumption</span>
                    <span className="font-bold text-secondary">{site.consumption} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">CO2 Offset</span>
                    <span className="font-bold text-accent">{site.co2} kg</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                {isOffline ? (
                  <button
                    onClick={() => handleReconnectSite(site.name)}
                    className="w-full py-1.5 bg-destructive text-white hover:bg-destructive/95 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                  >
                    Clear Alert & Reconnect
                  </button>
                ) : optimized ? (
                  <span className="flex items-center gap-1 text-[10px] text-accent font-semibold">
                    <Cpu className="w-3.5 h-3.5" /> AI Load Shift Active
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">No automation active</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="font-bold text-lg flex items-center gap-1.5"><MapPin className="w-5 h-5 text-primary" /> Commission Site</h3>
              <button onClick={() => setShowAddSiteModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddSite} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Facility Name / ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distribution Center South"
                  value={siteForm.name}
                  onChange={e => setSiteForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Solar Size (kWp)</label>
                  <input
                    type="number"
                    required
                    value={siteForm.generation}
                    onChange={e => setSiteForm(p => ({ ...p, generation: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Daily Demand (kWh)</label>
                  <input
                    type="number"
                    required
                    value={siteForm.consumption}
                    onChange={e => setSiteForm(p => ({ ...p, consumption: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Daily Carbon Offset (kg CO2)</label>
                <input
                  type="number"
                  required
                  value={siteForm.co2}
                  onChange={e => setSiteForm(p => ({ ...p, co2: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md transition-colors"
              >
                Register Location
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 2. VIEW: PERFORMANCE
  if (view === 'performance') return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5 text-sm text-muted-foreground">Coincident Peak Yield vs Load Profile</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={processedSites}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Bar dataKey="generation" fill="#FACC15" radius={[4, 4, 0, 0]} name="Solar (kWh)" />
            <Bar dataKey="consumption" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5 text-sm text-muted-foreground">Green Grid Feed-in Trends</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ENERGY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="export" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A34A' }} name="Grid Export (kWh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // 3. VIEW: OPTIMIZE
  if (view === 'optimize') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-bold text-lg mb-1 flex items-center gap-1.5"><Cpu className="w-5 h-5 text-primary" /> AI Automation Schedules</h2>
        <p className="text-xs text-muted-foreground">
          Deploy machine-learning algorithms to match HVAC intervals and fleet charging to peak irradiance curves.
        </p>
      </div>

      {sites.map(site => {
        const optimized = site.appliedOptimizations?.includes('AI-Load-Shift');
        const isOffline = offlineSites.includes(site.name.toLowerCase());
        return (
          <div key={site.id} className={`bg-card border rounded-2xl p-5 hover:shadow-sm transition-all ${
            isOffline ? 'border-destructive/20 bg-destructive/5' : optimized ? 'border-accent/35 bg-accent/5' : 'border-border'
          }`}>
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-sm text-foreground">{site.name} facility</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {isOffline ? (
                    <span className="text-destructive font-semibold">Communications Offline. Unable to push HVAC load shift telemetry.</span>
                  ) : (
                    <span>Suggested Optimization: Shift HVAC cycle setpoint to pre-cool at 11am. Estimated load mitigation: 15%.</span>
                  )}
                </p>
              </div>
              <button
                disabled={isOffline}
                onClick={() => handleToggleOptimize(site.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex-shrink-0 transition-all ${
                  isOffline 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border/40'
                    : optimized 
                      ? 'bg-accent/15 text-accent border border-accent/25 hover:bg-accent/20' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                }`}
              >
                {optimized ? 'Setpoints Engaged' : 'Engage AI Setpoints'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 4. VIEW: SUSTAINABILITY
  if (view === 'sustainability') return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'CO2 Offset Daily', value: `${totalCO2Saved.toLocaleString()} kg`, icon: Leaf, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Renewable Share', value: `${averageRPS}%`, icon: Sun, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'ESG Standard Class', value: esgGrade, icon: Star, color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-3`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-sm">Emissions Abatement Targets</h3>
          <span className="text-xs font-bold text-accent">{Math.min(100, Math.round((totalCO2Saved / 300) * 100))}% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full" style={{ width: `${Math.min(100, Math.round((totalCO2Saved / 300) * 100))}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Mitigating {(totalCO2Saved * 30).toLocaleString()} kg of carbon equivalent from traditional gas grids monthly based on active facilities.
        </p>

        <button
          onClick={handleDownloadESG}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Download Certified ESG Audit PDF
        </button>
      </div>
    </div>
  );

  // 5. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      {offlineSites.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Critical Grid Warning: Communication failure registered.</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lost remote communications link to: <span className="font-bold uppercase text-foreground">{offlineSites.join(', ')}</span>. Output registering 0 kWh.
            </p>
          </div>
          <button
            onClick={handleForceReconnectAll}
            className="px-3 py-1.5 bg-destructive text-white font-semibold rounded-lg text-xs hover:bg-destructive/90 transition-colors shadow-sm"
          >
            Reconnect All Facilities
          </button>
        </div>
      )}

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Cumulative Solar Yield', value: `${totalGeneration.toLocaleString()} kWh`, icon: Sun, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Corporate Demand', value: `${totalConsumption.toLocaleString()} kWh`, icon: Battery, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Net Grid Import', value: `${netGridDraw.toLocaleString()} kWh`, icon: Activity, color: netGridDraw > 50 ? 'text-destructive' : 'text-accent', bg: netGridDraw > 50 ? 'bg-destructive/10' : 'bg-accent/10' },
          { label: 'Carbon Abatement', value: `${totalCO2Saved.toLocaleString()} kg`, icon: Leaf, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-semibold mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Net Balance Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5 text-sm text-muted-foreground">Sub-site Net Energy Balances</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={processedSites}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Bar dataKey="generation" fill="#FACC15" radius={[4, 4, 0, 0]} name="Yield (kWh)" />
            <Bar dataKey="consumption" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Facilities quick-summary table */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">Corporate Facility Sites Status Audit</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border pb-2 text-muted-foreground font-semibold">
                <th className="py-2">Facility Name</th>
                <th className="py-2">Grid Status</th>
                <th className="py-2">Solar Output</th>
                <th className="py-2">Consumption Draw</th>
                <th className="py-2">Offsets (CO2)</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedSites.map((site, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-bold text-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {site.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] border ${
                      site.status === 'Offline' ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : 'bg-accent/10 text-accent border-accent/20'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-foreground">{site.generation} kWh</td>
                  <td className="py-3 font-semibold text-foreground">{site.consumption} kWh</td>
                  <td className="py-3 font-semibold text-accent">{site.co2} kg</td>
                  <td className="py-3 text-right">
                    {site.status === 'Offline' ? (
                      <button
                        onClick={() => handleReconnectSite(site.name)}
                        className="px-2 py-1 bg-destructive text-white rounded font-bold hover:bg-destructive/90 transition-colors text-[9px]"
                      >
                        Reconnect Link
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigate('/dashboard/sites');
                          toast.success(`Active control panel loaded for ${site.name}.`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Config <Eye className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
