import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun, Leaf, DollarSign, Activity, AlertTriangle, X, Check,
  Home, Star, CreditCard, ChevronRight, Send, AlertCircle, Wrench, Shield, Battery,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { db, SolarAssessment, Lead, Project, LoanApplication, ServiceRequest } from '@/lib/dashboardStore';
import { ENERGY_DATA } from '@/constants';

export default function ResidentialDashboard({ view }: { view: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const email = user?.email || '';

  // Core synchronized states
  const [assessment, setAssessment] = useState<SolarAssessment | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  // Local Form states
  const [assessForm, setAssessForm] = useState({ roof: '', shade: '10', bill: '' });
  const [assessLoading, setAssessLoading] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ type: 'Panel Cleaning', priority: 'Low' as const, notes: '' });
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ creditScore: '720', amount: '' });
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Alert dismissals
  const [faultAlert, setFaultAlert] = useState(true);

  // Sync data on load and on view change
  useEffect(() => {
    if (!email) return;
    const syncData = () => {
      setAssessment(db.getAssessmentForUser(email));

      // Get leads for this customer (mock match by matching name or checking all leads)
      const allLeads = db.getLeads();
      // In our mock DB, let's filter for leads submitted by this customer
      const userLeads = allLeads.filter(l => l.customer === user?.name);
      setLeads(userLeads);

      // Get active project
      const allProjects = db.getProjects();
      const userProj = allProjects.find(p => p.customer === user?.name);
      setActiveProject(userProj || null);

      // Get active loan application
      const allLoans = db.getLoanApplications();
      const userLoan = allLoans.find(l => l.applicant === user?.name);
      setActiveLoan(userLoan || null);

      // Get service requests
      const allReqs = db.getServiceRequests();
      const userReqs = allReqs.filter(r => r.customer === user?.name);
      setServiceRequests(userReqs);
    };

    syncData();
    window.addEventListener('solarphase_data_updated', syncData);
    return () => {
      window.removeEventListener('solarphase_data_updated', syncData);
    };
  }, [email, view, user?.name]);

  // Assessment Calculator
  const handleAssess = () => {
    if (!assessForm.roof || !assessForm.bill) {
      toast.error('Please enter your roof area and average monthly bill.');
      return;
    }
    setAssessLoading(true);
    setTimeout(() => {
      const billNum = parseFloat(assessForm.bill);
      const sizeKw = Math.round((billNum / 25) * 10) / 10; // estimate size
      const panels = Math.round((sizeKw * 1000) / 400); // 400W panels
      const annualSavings = Math.round(billNum * 12 * 0.85);
      const payback = Math.round((sizeKw * 2800) / annualSavings * 10) / 10;
      const co2 = Math.round(sizeKw * 150 * 12); // kg/year

      const newAssess: SolarAssessment = {
        roofArea: assessForm.roof,
        shadeFactor: assessForm.shade,
        monthlyBill: assessForm.bill,
        score: Math.min(100, Math.max(30, 95 - parseInt(assessForm.shade))),
        size: `${sizeKw} kW`,
        savings: `$${annualSavings.toLocaleString()}/year`,
        payback: `${payback} years`,
        panels,
        co2Offset: co2
      };

      db.saveAssessmentForUser(email, newAssess);
      setAssessment(newAssess);
      setAssessLoading(false);
      toast.success('AI Solar assessment complete! System configurations loaded.');
      window.dispatchEvent(new Event('solarphase_data_updated'));
    }, 1200);
  };

  // Submit quote request to Installer leads directory
  const handleRequestQuote = (installerName: string, budgetStr: string) => {
    if (!assessment) {
      toast.error('Please complete your solar assessment first.');
      return;
    }
    const lead = db.addLead({
      customer: user?.name || 'Solar Customer',
      size: assessment.size,
      location: 'Local Area',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      budget: budgetStr,
    });
    // Add to local state
    setLeads(prev => [...prev, lead]);
    toast.success(`Quote request sent to ${installerName}. Installers will review it shortly!`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Accept quote and trigger financing popup
  const handleAcceptQuote = (leadId: number, quotePrice: string) => {
    setSelectedLeadId(leadId);
    setLoanForm(p => ({ ...p, amount: quotePrice.replace(/[^0-9]/g, '') }));
    setShowLoanModal(true);
  };

  // Submit loan application
  const handleApplyLoan = () => {
    if (!loanForm.amount || !loanForm.creditScore) {
      toast.error('Please enter credit score and loan amount.');
      return;
    }
    const score = parseInt(loanForm.creditScore);
    const amount = parseInt(loanForm.amount);
    
    // Add to mock db
    const app = db.addLoanApplication({
      applicant: user?.name || 'Solar Customer',
      amount,
      creditScore: score,
      systemSize: assessment?.size || '6.0 kW',
    });

    setActiveLoan(app);
    setShowLoanModal(false);
    toast.success('Financing application submitted successfully. Lenders are reviewing your application.');
    window.dispatchEvent(new Event('solarphase_data_updated'));
    navigate('/dashboard/install');
  };

  // Accept Finance Option and Kick Off Project Installation
  const handleStartInstallation = () => {
    if (!activeLoan || activeLoan.status !== 'Approved') {
      toast.error('Financing must be approved to begin installation.');
      return;
    }

    // Add to projects list
    const proj = db.addProject({
      name: `${user?.name?.split(' ')[0] || 'My'} Residence`,
      customer: user?.name || 'Solar Customer',
      status: 'Site Survey',
      completion: 10,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      checklist: [
        { label: 'Site structural mapping & shade check', done: true },
        { label: 'Permit & utility interconnection filings', done: false },
        { label: 'Racking, framing & mount assembly', done: false },
        { label: 'Solar module & optimizer cabling', done: false },
        { label: 'Inverter integration & net metering sync', done: false }
      ]
    });

    setActiveProject(proj);
    toast.success('Contract signed! Installation scheduled. EPC installers have been dispatched.');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Submit maintenance request
  const handleRequestMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceForm.notes) {
      toast.error('Please enter service request notes.');
      return;
    }

    const newReq = db.addServiceRequest({
      customer: user?.name || 'Solar Customer',
      location: 'Local Area',
      priority: maintenanceForm.priority,
      type: maintenanceForm.type,
      notes: maintenanceForm.notes
    });

    setServiceRequests(prev => [...prev, newReq]);
    setShowMaintModal(false);
    setMaintenanceForm({ type: 'Panel Cleaning', priority: 'Low', notes: '' });
    toast.success('Maintenance ticket submitted. Service dispatch is assigning a technician.');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Simulation Helpers
  const simulateInstallerBid = (leadId: number) => {
    const allLeads = db.getLeads();
    const updated = allLeads.map(l => l.id === leadId ? { ...l, status: 'Accepted' as const, quotePrice: '14200' } : l);
    db.saveLeads(updated);
    setLeads(updated.filter(l => l.customer === user?.name));
    toast.success('Simulation: Contractor SunBuilders LLC accepted lead and offered $14,200!');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  const simulateLoanApproval = () => {
    const allLoans = db.getLoanApplications();
    const updated = allLoans.map(l => l.applicant === user?.name ? { ...l, status: 'Approved' as const } : l);
    db.saveLoanApplications(updated);
    const myLoan = updated.find(l => l.applicant === user?.name);
    setActiveLoan(myLoan || null);
    toast.success('Simulation: Financing Partner approved your solar loan application!');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  const simulateProjectAdvance = () => {
    if (!activeProject) return;
    const stages = ['Site Survey', 'Design', 'Permits', 'Installation', 'Commissioning', 'Active'] as const;
    const currentIdx = stages.indexOf(activeProject.status as any);
    const nextIdx = Math.min(stages.length - 1, currentIdx + 1);
    const nextStatus = stages[nextIdx];
    const nextComp = Math.round(((nextIdx + 1) / stages.length) * 100);
    
    const allProjects = db.getProjects();
    const updated = allProjects.map(p => {
      if (p.customer === user?.name) {
        return {
          ...p,
          status: nextStatus,
          completion: nextStatus === 'Active' ? 100 : nextComp,
          checklist: p.checklist?.map((item, idx) => idx <= nextIdx ? { ...item, done: true } : item)
        };
      }
      return p;
    });

    db.saveProjects(updated);
    const myProj = updated.find(p => p.customer === user?.name);
    setActiveProject(myProj || null);
    toast.success(`Simulation: EPC installer advanced construction stage to "${nextStatus}"!`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  const simulateTechnicianComplete = () => {
    const allReqs = db.getServiceRequests();
    const updated = allReqs.map(r => r.customer === user?.name ? { ...r, status: 'Completed' as const, technician: 'Mike Torres' } : r);
    db.saveServiceRequests(updated);
    setServiceRequests(updated.filter(r => r.customer === user?.name));
    setFaultAlert(false);
    toast.success('Simulation: Technician Mike Torres completed service. Health restored!');
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // 1. VIEW: ASSESSMENT
  if (view === 'assess') return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" /> AI Solar Potential Assessment
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Input your property specifications. Our engine will calculate rooftop feasibility, optimal panel array configurations, and expected annual yield.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rooftop Surface Area (sq ft)</label>
                <input
                  type="number"
                  value={assessForm.roof}
                  onChange={e => setAssessForm(p => ({ ...p, roof: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Average Shade Factor (%)</label>
                <select
                  value={assessForm.shade}
                  onChange={e => setAssessForm(p => ({ ...p, shade: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="5">Minimal Shading (5%)</option>
                  <option value="10">Light Shading (10%)</option>
                  <option value="20">Moderate Shading (20%)</option>
                  <option value="35">Heavy Shading (35%)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Average Monthly Electricity Bill ($)</label>
              <input
                type="number"
                value={assessForm.bill}
                onChange={e => setAssessForm(p => ({ ...p, bill: e.target.value }))}
                placeholder="e.g. 220"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={handleAssess}
              disabled={assessLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 text-sm"
            >
              {assessLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <><Sun className="w-5 h-5" /> Calculate Feasibility Report</>
              )}
            </button>
          </div>
        </div>

        {assessment && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-base">Rooftop Analysis Result</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-2xl font-black text-primary">{assessment.score}%</p>
                <p className="text-xs text-muted-foreground mt-1">Viability Score</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                <p className="text-2xl font-black text-accent">{assessment.size}</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended Size</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
                <p className="text-2xl font-black text-secondary">{assessment.panels}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Solar Panels</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-2xl font-black text-primary">{assessment.payback}</p>
                <p className="text-xs text-muted-foreground mt-1">Est. Payback</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted border border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Estimated Annual Savings:</span>{' '}
                <span className="font-bold text-accent">{assessment.savings}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Annual CO2 Reduction:</span>{' '}
                <span className="font-bold text-accent">{assessment.co2Offset.toLocaleString()} kg</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/quotes')}
              className="w-full flex items-center justify-center gap-1.5 px-5 py-3 mt-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm shadow-sm"
            >
              Compare Installer Bids & Quotes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Leaf className="w-4.5 h-4.5 text-accent" /> Environmental ROI</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A {assessment?.size || '6 kW'} solar array mitigates reliance on high-carbon coal and gas grids.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
              <span className="text-muted-foreground">Equivalent Trees Planted</span>
              <span className="font-semibold text-accent">{assessment ? Math.round(assessment.co2Offset / 21.7) : 134} trees</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
              <span className="text-muted-foreground">Coal Burn Mitigated</span>
              <span className="font-semibold text-accent">{assessment ? Math.round(assessment.co2Offset * 1.1) : 3130} lbs</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">EPA Environmental Tier</span>
              <span className="font-semibold text-primary">Class-A Green Grid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. VIEW: REQUEST QUOTES
  if (view === 'quotes') return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">Compare Vetted Solar Contractors</h2>
        <p className="text-muted-foreground text-sm">
          Compare proposal estimates from local licensed solar installers. Submit quote requests to get firm pricing bids.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 1, name: 'SunBuilders LLC', rating: 4.9, text: 'Tier 1 installer, 15+ years experience, expert micro-inverters.', price: '$14,800', budget: '$13,000–$16,000' },
          { id: 2, name: 'BrightGrid Solar', rating: 4.7, text: 'Authorized solar roofing, Enphase battery backups certified.', price: '$15,900', budget: '$14,500–$17,500' },
          { id: 3, name: 'EcoSun Contractors', rating: 4.5, text: 'Local cooperative, standard racking, lowest cost guarantee.', price: '$13,200', budget: '$12,000–$14,500' },
        ].map(inst => {
          // Check if this installer has an active lead status in the database
          const activeLead = leads.find(l => l.budget === inst.budget);
          
          return (
            <div key={inst.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{inst.name}</p>
                    <span className="flex items-center text-xs text-amber-500 font-semibold gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {inst.rating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{inst.text}</p>
                  <p className="text-xs font-semibold text-primary mt-2">Target Budget: {inst.budget}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  <p className="text-xl font-black text-primary">{activeLead?.quotePrice ? `$${parseInt(activeLead.quotePrice).toLocaleString()}` : inst.price}</p>
                </div>

                {!activeLead && (
                  <button
                    onClick={() => handleRequestQuote(inst.name, inst.budget)}
                    className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm shadow-sm"
                  >
                    Request Proposal
                  </button>
                )}

                {activeLead && activeLead.status === 'Pending' && (
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      disabled
                      className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Pending Bid
                    </button>
                    <button
                      onClick={() => simulateInstallerBid(activeLead.id)}
                      className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Contractor Bid (Sandbox)
                    </button>
                  </div>
                )}

                {activeLead && activeLead.status === 'Accepted' && (
                  activeLoan ? (
                    <button
                      onClick={() => navigate('/dashboard/install')}
                      className="px-4 py-2.5 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 font-semibold rounded-xl transition-all text-sm shadow-sm flex items-center gap-1"
                    >
                      Track Installation <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAcceptQuote(activeLead.id, activeLead.quotePrice || '15000')}
                      className="px-4 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm shadow-sm flex items-center gap-1"
                    >
                      <CreditCard className="w-4 h-4" /> Finance Offer
                    </button>
                  )
                )}

                {activeLead && activeLead.status === 'Declined' && (
                  <span className="text-sm font-semibold text-destructive px-3 py-1 bg-destructive/10 rounded-lg">Declined</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financing application Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="font-bold text-lg">Solar Loan Application</h3>
              <button onClick={() => setShowLoanModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Total Requested Amount ($)</label>
                <input
                  type="number"
                  value={loanForm.amount}
                  onChange={e => setLoanForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">FICO Credit Score (estimate)</label>
                <input
                  type="number"
                  value={loanForm.creditScore}
                  onChange={e => setLoanForm(p => ({ ...p, creditScore: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Applying trigger a soft-credit check. Partner financiers (SunLoan Capital, GreenEnergy) will inspect scores. FICO &gt; 680 generally approved instantly.
              </p>
              <button
                onClick={handleApplyLoan}
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
              >
                Submit Loan Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 3. VIEW: INSTALLATION
  if (view === 'install') return (
    <div className="max-w-2xl space-y-6">
      {!activeProject && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg">No Active Installation</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
              Ready to begin system construction? Request a contractor quote, get financing approval, and confirm your installer!
            </p>
          </div>
          {activeLoan && activeLoan.status === 'Approved' ? (
            <button
              onClick={handleStartInstallation}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
            >
              Sign Contract & Dispatch EPC Installer
            </button>
          ) : activeLoan && activeLoan.status === 'Pending' ? (
            <div className="flex flex-col items-center gap-2.5">
              <div className="inline-block px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm font-semibold border border-yellow-500/20">
                Waiting for Loan Approval
              </div>
              <button
                onClick={simulateLoanApproval}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Lender Loan Approval (Sandbox)
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard/quotes')}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md transition-colors"
            >
              View Quotes Directory
            </button>
          )}
        </div>
      )}
 
      {activeProject && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg">{activeProject.name} installation</h2>
              <p className="text-xs text-muted-foreground mt-0.5">EPC Partner: SunBuilders LLC · Target Launch: {activeProject.date}</p>
            </div>
            <span className="text-sm font-black text-primary">{activeProject.completion}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
            <div className="bg-primary h-3 rounded-full transition-all duration-700" style={{ width: `${activeProject.completion}%` }} />
          </div>
          <div className="space-y-3">
            {activeProject.checklist?.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${step.done ? 'border-accent/30 bg-accent/5' : 'border-border'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${step.done ? 'bg-accent border-accent' : 'border-border'}`}>
                  {step.done && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`font-semibold text-sm ${step.done ? 'line-through text-muted-foreground' : ''}`}>{step.label}</span>
              </div>
            ))}
          </div>
          {activeProject.completion < 100 && (
            <button
              onClick={simulateProjectAdvance}
              className="mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 font-semibold rounded-xl hover:bg-primary/20 transition-colors text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Installation Progress (Sandbox)
            </button>
          )}
        </div>
      )}
    </div>
  );

  // 4. VIEW: MONITORING
  if (view === 'monitoring') return (
    <div className="space-y-6">
      {faultAlert && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Inverter system health reporting under-voltage (AC out at 94%).</p>
            <p className="text-xs text-muted-foreground mt-0.5">Firmware diagnostics flag possible panel dust blockage or shading issue.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMaintModal(true)}
              className="px-3 py-1.5 bg-amber-500 text-white font-semibold rounded-lg text-xs hover:bg-amber-600 transition-colors"
            >
              Request Service
            </button>
            <button
              onClick={simulateTechnicianComplete}
              className="px-3 py-1.5 bg-accent text-white font-semibold rounded-lg text-xs hover:bg-accent/90 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Repair (Sandbox)
            </button>
            <button onClick={() => setFaultAlert(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Generated Today', value: '47.3 kWh', icon: Sun, color: 'text-primary', bg: 'bg-primary/10', trend: 'Optimal Sunlight' },
          { label: 'Saved Today', value: '$9.84', icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10', trend: '+$1.12 vs avg' },
          { label: 'Monthly Savings', value: '$342', icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10', trend: 'Payback 18% complete' },
          { label: 'System Health', value: faultAlert ? '94.0%' : '99.8%', icon: Activity, color: faultAlert ? 'text-amber-500' : 'text-accent', bg: faultAlert ? 'bg-amber-500/10' : 'bg-accent/10', trend: faultAlert ? 'Degraded AC output' : '100% nominal' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-5">Power Harvest vs Consumption (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={ENERGY_DATA}>
              <defs>
                <linearGradient id="genColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="consColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="generation" stroke="#FACC15" strokeWidth={2.5} fill="url(#genColor)" name="Yield (kWh)" />
              <Area type="monotone" dataKey="consumption" stroke="#2563EB" strokeWidth={2.5} fill="url(#consColor)" name="Usage (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Wrench className="w-4.5 h-4.5 text-primary" /> Active Service Tickets
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Track technicians dispatched to your system.</p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {serviceRequests.map(r => (
                <div key={r.id} className="p-3 bg-muted border border-border rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">{r.type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${r.status === 'Open' ? 'bg-secondary/10 text-secondary' : r.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600' : 'bg-accent/10 text-accent'}`}>{r.status}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-1">{r.notes}</p>
                  {r.technician && <p className="text-[10px] text-primary">Tech Assigned: {r.technician}</p>}
                </div>
              ))}
              {serviceRequests.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-6">No service requests submitted yet.</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowMaintModal(true)}
            className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 text-xs transition-all shadow-sm"
          >
            Submit Custom Service Request
          </button>
        </div>
      </div>

      {/* Service Request Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="font-bold text-lg flex items-center gap-1.5"><Wrench className="w-5 h-5 text-primary" /> Request Maintenance</h3>
              <button onClick={() => setShowMaintModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRequestMaintenance} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Issue Category</label>
                <select
                  value={maintenanceForm.type}
                  onChange={e => setMaintenanceForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Panel Cleaning</option>
                  <option>Inverter Fault Diagnostics</option>
                  <option>Battery Storage Failure</option>
                  <option>Hardware Frame Structural Repair</option>
                  <option>Annual Inspection</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Urgency Priority</label>
                <select
                  value={maintenanceForm.priority}
                  onChange={e => setMaintenanceForm(p => ({ ...p, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Low">Low - Maintenance scheduled in next 2 weeks</option>
                  <option value="Medium">Medium - Response requested in 3-5 days</option>
                  <option value="High">High - Emergency repair (inverter fire, complete outage)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Fault Symptoms / Notes</label>
                <textarea
                  rows={3}
                  value={maintenanceForm.notes}
                  onChange={e => setMaintenanceForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Explain system error codes, inverter display, solar panel shading or debris, etc."
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
              >
                Submit Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 5. VIEW: ENVIRONMENTAL IMPACT
  if (view === 'impact') return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'CO2 Offset', value: assessment ? `${assessment.co2Offset.toLocaleString()} kg` : '2,847 kg', icon: Leaf, color: 'text-accent', bg: 'bg-accent/10', sub: 'Calculated this year' },
          { label: 'Trees Equivalent', value: assessment ? `${Math.round(assessment.co2Offset / 21.7)}` : '134', icon: Sun, color: 'text-primary', bg: 'bg-primary/10', sub: 'Trees planted equivalent' },
          { label: 'Green Energy Score', value: assessment ? `${assessment.score}/100` : '87/100', icon: Battery, color: 'text-secondary', bg: 'bg-secondary/10', sub: 'Grid offsets percentile' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-3`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="font-semibold mt-1 text-sm">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sustainability Goal Targets</h3>
          <span className="text-sm font-bold text-accent">71%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div className="bg-gradient-to-r from-accent to-primary h-4 rounded-full" style={{ width: '71%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {assessment ? `${assessment.co2Offset.toLocaleString()} kg` : '2,847 kg'} of 4,000 kg annual CO2 emissions offset target achieved
        </p>
      </div>

      {/* Renewable Energy Certificates */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Renewable Energy Certificates (RECs)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          RECs are verified proof of green energy production. For every 1,000 kWh generated, you receive 1 REC token which can be traded or credited.
        </p>
        <div className="space-y-3">
          {[
            { id: 'REC-2026-004', month: 'May 2026 Harvest', amount: '1.2 RECs', status: 'Issued' },
            { id: 'REC-2026-003', month: 'April 2026 Harvest', amount: '1.0 RECs', status: 'Issued' },
            { id: 'REC-2026-002', month: 'March 2026 Harvest', amount: '0.8 RECs', status: 'Issued' },
          ].map(rec => (
            <div key={rec.id} className="flex justify-between items-center p-3 rounded-xl bg-muted border border-border text-xs">
              <div>
                <p className="font-semibold text-foreground">{rec.month}</p>
                <p className="text-[10px] text-muted-foreground">Certificate Serial: {rec.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">{rec.amount}</p>
                <span className="text-[9px] font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded">{rec.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 6. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      {faultAlert && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Inverter operating at degraded output (94%). Dust shading detected.</p>
            <p className="text-xs text-muted-foreground mt-0.5">Please check panel health status in the Support tab.</p>
          </div>
          <button onClick={() => setFaultAlert(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Dash Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Sun, label: 'Today Generation', value: '47.3 kWh', sub: '+12% vs yesterday', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Leaf, label: 'CO2 Saved Today', value: '21.4 kg', sub: 'Equivalent to 2.1 trees', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: DollarSign, label: 'Saved This Month', value: '$342', sub: '$4,104 projected annual', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: Activity, label: 'System Health', value: faultAlert ? '94%' : '100%', sub: faultAlert ? 'Needs inspection' : 'Nominal output', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            <p className="text-muted-foreground text-xs mb-1 font-medium">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-5">Solar Yield - Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={ENERGY_DATA}>
              <defs>
                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px' }} />
              <Area type="monotone" dataKey="generation" stroke="#FACC15" strokeWidth={2} fill="url(#areaColor)" name="Generation (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Workflow steps */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Solar Onboarding Journey</h3>
          <div className="space-y-3">
            {[
              { label: 'Assess Solar Potential', status: assessment ? 'Complete' : 'Start Assessment', done: !!assessment, tab: 'assess' },
              { label: 'Request Installer Quotes', status: leads.length > 0 ? (leads.some(l => l.status === 'Accepted') ? 'Offer Received' : 'Bids Requested') : 'Request Quotes', done: leads.length > 0, tab: 'quotes' },
              { label: 'Apply Financing Partner', status: activeLoan ? (activeLoan.status === 'Approved' ? 'Funded' : 'Pending') : 'Submit Loan', done: !!activeLoan && activeLoan.status === 'Approved', tab: 'quotes' },
              { label: 'Track System Installation', status: activeProject ? `${activeProject.completion}% done` : 'Pending Contract', done: activeProject?.completion === 100, tab: 'install' },
              { label: 'Monitor Energy Harvest', status: activeProject?.status === 'Active' ? 'Active' : 'Awaiting Commission', done: activeProject?.status === 'Active', tab: 'monitoring' },
            ].map((step, i) => (
              <button
                key={i}
                onClick={() => navigate(`/dashboard/${step.tab}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-xs transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-accent border-accent text-white' : 'border-border bg-background'}`}>
                    {step.done && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-semibold text-foreground">{step.label}</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold whitespace-nowrap flex items-center gap-0.5 ${step.done ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                  {step.status} <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
