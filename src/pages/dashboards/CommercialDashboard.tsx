import { useState, useEffect } from 'react';
import {
  BarChart3, DollarSign, TrendingUp, Leaf, Download, FolderOpen,
  CreditCard, Cpu, CheckCircle, ChevronRight, X, Clock, HelpCircle, Check
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { db, LoanApplication, Project, EnterpriseSite } from '@/lib/dashboardStore';

export default function CommercialDashboard({ view }: { view: string }) {
  const { user } = useAuth();
  
  // Dynamic stores
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<EnterpriseSite[]>([]);

  // Local calculator & state
  const [emiCalc, setEmiCalc] = useState({ amount: '150000', rate: '6.5', tenure: '10' });
  const [emiResult, setEmiResult] = useState<number | null>(null);
  const [selectedSite, setSelectedSite] = useState('HQ');
  const [appliedRecos, setAppliedRecos] = useState<number[]>([]);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ companyName: user?.company || 'My Company', creditScore: '740', amount: '150000' });

  useEffect(() => {
    // Sync active loan
    const loans = db.getLoanApplications();
    const myLoan = loans.find(l => l.applicant === (user?.company || user?.name));
    setActiveLoan(myLoan || null);

    // Sync projects
    const allProjects = db.getProjects();
    const myProjects = allProjects.filter(p => p.customer === (user?.company || user?.name));
    setActiveProjects(myProjects);

    // Sync enterprise sites
    setSites(db.getSites());
  }, [view, user?.company, user?.name]);

  const calcEMI = () => {
    const P = parseFloat(emiCalc.amount);
    const r = parseFloat(emiCalc.rate) / 100 / 12;
    const n = parseFloat(emiCalc.tenure) * 12;
    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r <= 0 || n <= 0) {
      toast.error('Please input valid numeric values for EMI calculation.');
      return;
    }
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    setEmiResult(Math.round(emi));
    toast.success('EMI calculation complete.');
  };

  const handleApplyLoan = () => {
    if (!loanForm.amount || !loanForm.creditScore) {
      toast.error('Please enter credit score and loan amount.');
      return;
    }
    const app = db.addLoanApplication({
      applicant: user?.company || user?.name || 'Commercial Business',
      amount: parseInt(loanForm.amount),
      creditScore: parseInt(loanForm.creditScore),
      systemSize: selectedSite === 'HQ' ? '180 kWp' : selectedSite === 'Warehouse' ? '440 kWp' : '320 kWp',
      isCommercial: true
    });
    setActiveLoan(app);
    setShowLoanModal(false);
    toast.success('Commercial solar financing application submitted to lenders.');
  };

  const handleInitiateProject = (siteName: string) => {
    // First step in project onboarding for commercial
    toast.info(`Solar Potential assessment generated for ${siteName}. Applying for financing is recommended.`);
    setLoanForm(p => ({
      ...p,
      amount: siteName === 'HQ' ? '120000' : siteName === 'Warehouse' ? '280000' : '210000'
    }));
    setShowLoanModal(true);
  };

  const applyReco = (index: number) => {
    setAppliedRecos(prev => [...prev, index]);
    toast.success('Optimization setpoints updated. AI load controller has shifted scheduling.');
  };

  const exportCSV = () => {
    toast.success('Preparing energy report CSV data packet...');
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8,Hour,Usage(kWh),SolarGen(kWh)\n6am,42,12\n9am,87,64\n12pm,134,112\n3pm,156,98\n6pm,98,40\n9pm,54,0";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `SolarPhase_EnergyReport_${selectedSite}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV Download started.');
    }, 800);
  };

  // Mock graphs data
  const usageHourData = [
    { hour: '6am', usage: 42, solar: 10 },
    { hour: '9am', usage: 87, solar: 65 },
    { hour: '12pm', usage: 134, solar: 140 },
    { hour: '3pm', usage: 156, solar: 110 },
    { hour: '6pm', usage: 98, solar: 35 },
    { hour: '9pm', usage: 54, solar: 0 },
  ];

  const roiProjectionData = [
    { year: 'Year 1', savings: 14500, investment: 150000 },
    { year: 'Year 2', savings: 32000, investment: 150000 },
    { year: 'Year 3', savings: 54000, investment: 150000 },
    { year: 'Year 4', savings: 78000, investment: 150000 },
    { year: 'Year 5', savings: 106000, investment: 150000 },
    { year: 'Year 6', savings: 138000, investment: 150000 },
    { year: 'Year 7', savings: 172000, investment: 150000 },
  ];

  const siteDataMap = {
    HQ: { roof: '8,400 sqft', capacity: '180 kWp', annualGen: '216,000 kWh/yr', savings: '$32,400/yr' },
    Warehouse: { roof: '22,000 sqft', capacity: '440 kWp', annualGen: '528,000 kWh/yr', savings: '$79,200/yr' },
    Factory: { roof: '15,600 sqft', capacity: '320 kWp', annualGen: '384,000 kWh/yr', savings: '$57,600/yr' }
  };

  const selectedSiteDetails = siteDataMap[selectedSite as keyof typeof siteDataMap] || siteDataMap.HQ;

  // 1. VIEW: ENERGY USAGE
  if (view === 'usage') return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="font-bold text-lg">Industrial Consumption Analysis</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time smart meter integration for commercial load profiling.</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-muted border border-border hover:bg-muted/80 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Consumption Data
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Monthly Power Input', value: '18,420 kWh', color: 'text-primary' },
            { label: 'Facility Peak Demand', value: '156 kW', color: 'text-destructive' },
            { label: 'Solar Supply Coverage', value: '62.4%', color: 'text-accent' },
            { label: 'Imported Grid Balance', value: '6,920 kWh', color: 'text-secondary' },
          ].map((s, i) => (
            <div key={i} className="bg-muted/50 border border-border/40 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={usageHourData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Bar dataKey="usage" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
            <Bar dataKey="solar" fill="#FACC15" radius={[4, 4, 0, 0]} name="Coincident Solar (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // 2. VIEW: PROJECT PLANNING
  if (view === 'planning') return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-2">Commercial Site Planner</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Configure prospective rooftop structures and review pre-feasibility ROI metrics before initiating design cycles.
        </p>

        <div className="flex bg-muted rounded-xl p-1 gap-1 max-w-xs mb-6 border border-border/40">
          {['HQ', 'Warehouse', 'Factory'].map(site => (
            <button
              key={site}
              onClick={() => setSelectedSite(site)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${selectedSite === site ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}
            >
              {site}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Usable Rooftop Area', value: selectedSiteDetails.roof },
            { label: 'Simulated Solar Capacity', value: selectedSiteDetails.capacity },
            { label: 'Expected Annual Generation', value: selectedSiteDetails.annualGen },
            { label: 'Net Annual Savings Projection', value: selectedSiteDetails.savings },
          ].map((item, i) => (
            <div key={i} className="bg-muted/50 border border-border/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{item.label}</p>
              <p className="font-black text-lg text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Project Status</span>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 inline-block border border-amber-500/20">Planning Stage</span>
          </div>
          <button
            onClick={() => handleInitiateProject(selectedSite)}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
          >
            Initiate Project for {selectedSite}
          </button>
        </div>
      </div>
    </div>
  );

  // 3. VIEW: FINANCING
  if (view === 'financing') return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Loan EMI Calculator</h2>
          <p className="text-xs text-muted-foreground mb-6">Calculate amortization schedules and net interest burdens on solar debt financing.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Principal ($)</label>
                <input
                  type="number"
                  value={emiCalc.amount}
                  onChange={e => setEmiCalc(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={emiCalc.rate}
                  onChange={e => setEmiCalc(p => ({ ...p, rate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Tenure (Years)</label>
                <input
                  type="number"
                  value={emiCalc.tenure}
                  onChange={e => setEmiCalc(p => ({ ...p, tenure: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
            </div>
            <button
              onClick={calcEMI}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-sm transition-colors"
            >
              Calculate Amortization
            </button>

            {emiResult && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Monthly Installment</p>
                <p className="text-3xl font-black text-accent">${emiResult.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total Paid: ${(emiResult * parseInt(emiCalc.tenure) * 12).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Subsidy Management */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base mb-4">Eligible Commercial Subsidies</h3>
          <div className="space-y-3">
            {[
              { name: 'Federal Investment Tax Credit (ITC)', amount: '30% of system cost', desc: 'Direct credit towards corporate income taxes.', applied: false },
              { name: 'USDA REAP Federal Grant', amount: 'Up to 40% of total project cost', desc: 'Available for rural enterprises and agriculture.', applied: false },
              { name: 'MACRS Depreciation Credit', amount: '5-year accelerated depreciation asset mapping', desc: 'Tax write-off for industrial capital equipment.', applied: true },
            ].map((sub, i) => (
              <div key={i} className="flex justify-between items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 text-xs">
                <div>
                  <p className="font-bold text-foreground">{sub.name}</p>
                  <p className="text-[10px] font-semibold text-accent mt-0.5">{sub.amount}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{sub.desc}</p>
                </div>
                <button
                  onClick={() => toast.success(`Subsidy claim submitted under MACRS / EPA guidelines.`)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex-shrink-0 ${sub.applied ? 'bg-accent/10 text-accent cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                >
                  {sub.applied ? 'Claim Verified' : 'File Claim'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side loan application tracker */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base">Financing Status</h3>
          {!activeLoan && (
            <div className="text-center py-6 space-y-3">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto" />
              <div>
                <p className="font-semibold text-sm">No Active Application</p>
                <p className="text-xs text-muted-foreground mt-0.5">Submit financing files to unlock capital.</p>
              </div>
              <button
                onClick={() => setShowLoanModal(true)}
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow-sm"
              >
                Apply for Commercial Loan
              </button>
            </div>
          )}

          {activeLoan && (
            <div className="space-y-3 border border-border bg-muted/40 p-4 rounded-xl text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Borrower</span>
                <span className="font-semibold">{activeLoan.applicant}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Requested Capital</span>
                <span className="font-bold text-primary">${activeLoan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">System Size</span>
                <span className="font-semibold">{activeLoan.systemSize}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Credit Class</span>
                <span className="font-semibold">FICO {activeLoan.creditScore}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${activeLoan.status === 'Approved' ? 'bg-accent/10 text-accent' : activeLoan.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-destructive/10 text-destructive'}`}>
                  {activeLoan.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loan Application Dialog */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="font-bold text-lg">Corporate Solar Financing</h3>
              <button onClick={() => setShowLoanModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Company Entity Name</label>
                <input
                  type="text"
                  value={loanForm.companyName}
                  onChange={e => setLoanForm(p => ({ ...p, companyName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Principal Capital ($)</label>
                <input
                  type="number"
                  value={loanForm.amount}
                  onChange={e => setLoanForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Corporate Credit Rating (e.g. Dun & Bradstreet / FICO Equivalent)</label>
                <input
                  type="number"
                  value={loanForm.creditScore}
                  onChange={e => setLoanForm(p => ({ ...p, creditScore: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleApplyLoan}
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
              >
                Submit Loan File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 4. VIEW: MONITOR ROI
  if (view === 'roi') return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Payback Period', value: '6.4 years', color: 'text-primary', desc: 'Payback trajectory threshold' },
          { label: 'Internal Rate of Return (IRR)', value: '18.3%', color: 'text-accent', desc: 'Yield over 25 year lifetime' },
          { label: 'NPV Mitigation Asset', value: '$387,000', color: 'text-secondary', desc: 'Net Present Value savings' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <p className="text-xs text-muted-foreground font-medium mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5">Cumulative Savings Projection (MACRS Included)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={roiProjectionData}>
            <defs>
              <linearGradient id="roiColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="savings" stroke="#16A34A" strokeWidth={2.5} fill="url(#roiColor)" name="Net Savings ($)" />
            <Line type="monotone" dataKey="investment" stroke="#FACC15" strokeDasharray="5 5" dot={false} strokeWidth={2} name="Investment ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // 5. VIEW: OPTIMIZE
  if (view === 'optimize') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2"><Cpu className="w-5 h-5 text-primary" /> Active Smart Grid Integration</h2>
        <p className="text-xs text-muted-foreground">
          AI-driven load controller coordinates machine intervals during solar peak hours to mitigate grid demand peaks.
        </p>
      </div>

      {[
        { title: 'Shift machinery load to 11am–2pm', impact: '18% Savings', detail: 'Peak solar generation window — run high-demand manufacturing cycles during this period to maximize solar self-consumption.' },
        { title: 'Reduce HVAC setpoint by 2°F overnight', impact: '8% Savings', detail: 'Pre-cool office facility during afternoon solar capacity to mitigate evening HVAC energy peaks.' },
        { title: 'Enable EV fleet charging at 12pm–3pm', impact: '12% Savings', detail: 'Restrict employee and transport EV charging to peak irradiance hours.' },
        { title: 'Install automated demand response sensors', impact: '22% Savings', detail: 'Connect major loads to automated smart grids for instant load shedding.' },
      ].map((r, i) => {
        const applied = appliedRecos.includes(i);
        return (
          <div key={i} className={`bg-card border rounded-2xl p-5 hover:shadow-sm transition-all ${applied ? 'border-accent/35 bg-accent/5' : 'border-border'}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">{r.title}</p>
                  <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{r.impact}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.detail}</p>
              </div>
              <button
                onClick={() => !applied && applyReco(i)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl flex-shrink-0 transition-colors ${applied ? 'bg-accent/10 text-accent cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              >
                {applied ? 'Recommendation Applied' : 'Activate Load Shift'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 6. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Power Consumption', value: '18,420 kWh', sub: 'HQ + Warehouse + Factory', icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Energy Savings', value: '$2,482', sub: 'This billing cycle', icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Rooftop Offset Ratio', value: '62%', sub: 'Self-consumption share', icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'CO2 Mitigated', value: '18.4 tons', sub: 'Equivalent to 846 trees', icon: Leaf, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5">Sub-site Yield vs Consumption (Monthly Aggregated)</h3>
        <ResponsiveContainer width="100%" height={230}>
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
