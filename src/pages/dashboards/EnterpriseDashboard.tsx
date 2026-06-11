import { useState, useEffect } from 'react';
import {
  MapPin, BarChart3, Leaf, Cpu, Star, Download, PlusCircle, X, Check,
  Activity, Sun, Battery
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { db, EnterpriseSite } from '@/lib/dashboardStore';
import { ENERGY_DATA } from '@/constants';

export default function EnterpriseDashboard({ view }: { view: string }) {
  // Shared state
  const [sites, setSites] = useState<EnterpriseSite[]>([]);
  
  // Local forms
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: '', generation: '120', consumption: '110', co2: '55' });

  useEffect(() => {
    // Load enterprise sites
    setSites(db.getSites());
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

    setSites(prev => [...prev, newSite]);
    setShowAddSiteModal(false);
    setSiteForm({ name: '', generation: '120', consumption: '110', co2: '55' });
    toast.success(`Facility site ${newSite.name} registered under active corporate grid.`);
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
  };

  // Download ESG corporate report
  const handleDownloadESG = () => {
    toast.info('Analyzing corporate emissions profiles...');
    setTimeout(() => {
      const genTotal = sites.reduce((acc, s) => acc + s.generation, 0);
      const consTotal = sites.reduce((acc, s) => acc + s.consumption, 0);
      const co2Total = sites.reduce((acc, s) => acc + s.co2, 0);

      const esgContent = `SOLARPHASE ESG CORPORATE SUSTAINABILITY REPORT\n` +
        `==================================================\n` +
        `Reporting Period: Q2 2026 Audit\n` +
        `Aggregated Multi-Site Summary:\n` +
        `--------------------------------------------------\n` +
        `- Sites Configured: ${sites.length} Active Facilities\n` +
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

  const totalCO2Saved = sites.reduce((acc, s) => acc + s.co2, 0);

  // 1. VIEW: MONITOR SITES
  if (view === 'sites') return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-lg">Multi-Site Facility Registry</h2>
          <p className="text-xs text-muted-foreground">Monitor real-time energy imports, harvest yields, and connectivity statuses.</p>
        </div>
        <button
          onClick={() => setShowAddSiteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors shadow-md"
        >
          <PlusCircle className="w-4 h-4" /> Commission New Facility
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sites.map(site => {
          const optimized = site.appliedOptimizations?.includes('AI-Load-Shift');
          return (
            <div key={site.id} className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${optimized ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><MapPin className="w-5 h-5" /></div>
                    <p className="font-bold text-foreground text-sm">{site.name}</p>
                  </div>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">Online</span>
                </div>
                <div className="space-y-3.5 text-xs text-foreground">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Generation Yield</span>
                    <span className="font-bold text-primary">{site.generation} kWh</span>
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

              {optimized && (
                <div className="mt-4 pt-3 border-t border-accent/20 flex items-center gap-1.5 text-[10px] text-accent font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> AI Load Balance Active
                </div>
              )}
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
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
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
          <BarChart data={sites}>
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
        return (
          <div key={site.id} className={`bg-card border rounded-2xl p-5 hover:shadow-sm transition-all ${optimized ? 'border-accent/35 bg-accent/5' : 'border-border'}`}>
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-sm text-foreground">{site.name} facility</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Suggested Optimization: Shift HVAC cycle setpoint to pre-cool at 11am. Estimated load mitigation: 14%
                </p>
              </div>
              <button
                onClick={() => handleToggleOptimize(site.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex-shrink-0 transition-colors ${optimized ? 'bg-accent/10 text-accent cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
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
          { label: 'CO2 Offset Daily', value: `${totalCO2Saved} kg`, icon: Leaf, color: 'text-accent' },
          { label: 'Green Energy Share', value: '67.4%', icon: Sun, color: 'text-primary' },
          { label: 'ESG Standard Class', value: 'A+ Class', icon: Star, color: 'text-secondary' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-3`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-sm">Emissions Abatement Targets</h3>
          <span className="text-xs font-bold text-accent">67% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full" style={{ width: '67%' }} />
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Mitigated {totalCO2Saved * 30} kg of carbon equivalent from traditional gas grids over last 30 billing cycles.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sites.map(site => (
          <div key={site.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4.5 h-4.5 text-primary" />
              <p className="font-bold text-sm">{site.name}</p>
            </div>
            <div className="space-y-2 text-xs text-foreground">
              <div className="flex justify-between"><span className="text-muted-foreground">Generation</span><span className="font-semibold text-primary">{site.generation} kWh</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Consumption</span><span className="font-semibold text-secondary">{site.consumption} kWh</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CO2 Offset</span><span className="font-semibold text-accent">{site.co2} kg</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5 text-sm text-muted-foreground">Sub-site Net Energy Balances</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sites}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Bar dataKey="generation" fill="#FACC15" radius={[4, 4, 0, 0]} name="Yield (kWh)" />
            <Bar dataKey="consumption" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
