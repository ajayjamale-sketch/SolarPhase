import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FolderOpen, CheckCircle, DollarSign, Building2, Wrench, HardHat,
  ThumbsUp, ThumbsDown, RefreshCw, Check, Clock, Upload, ArrowRight, Eye,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { db, Lead, Project, ServiceRequest } from '@/lib/dashboardStore';

export default function InstallerDashboard({ view }: { view: string }) {
  const { user, updateUser, login } = useAuth();
  const navigate = useNavigate();

  // Shared synchronized states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<ServiceRequest[]>([]);

  // Local Form states
  const [profile, setProfile] = useState({
    company: user?.company || 'SunBuilders LLC',
    license: 'CA-SOL-28491',
    area: 'Greater Bay Area, CA'
  });
  const [bidPrices, setBidPrices] = useState<Record<number, string>>({});
  const [activeProjectId, setActiveProjectId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('solarphase_installer_active_project_id');
      return stored ? parseInt(stored) : null;
    } catch {
      return null;
    }
  });

  const [isPending, setIsPending] = useState(false);
  const companyName = user?.company || 'SunBuilders LLC';

  // Database Sync Helper
  const syncData = () => {
    setLeads(db.getLeads());
    setProjects(db.getProjects());
    setMaintenanceTickets(db.getServiceRequests());
  };

  useEffect(() => {
    syncData();
    window.addEventListener('solarphase_data_updated', syncData);
    return () => window.removeEventListener('solarphase_data_updated', syncData);
  }, [view]);

  useEffect(() => {
    const checkStatus = () => {
      try {
        const stored = localStorage.getItem('solarphase_admin_installers');
        const list = stored ? JSON.parse(stored) : [];
        const record = list.find((i: any) => i.name.toLowerCase() === companyName.toLowerCase());
        setIsPending(record ? record.status === 'Pending' : false);
      } catch {
        setIsPending(false);
      }
    };
    checkStatus();
    window.addEventListener('solarphase_data_updated', checkStatus);
    return () => window.removeEventListener('solarphase_data_updated', checkStatus);
  }, [companyName]);

  if (isPending && view !== 'profile') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        {/* Step-by-step progress stepper */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-6 text-foreground flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-500 animate-bounce" /> Contractor Vetting Portal
          </h2>
          <div className="relative flex justify-between items-center max-w-xl mx-auto px-4">
            {/* Background progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" />

            {[
              { label: 'Register Account', desc: 'Completed', active: true, done: true },
              { label: 'License Audit', desc: 'Auto-verified', active: true, done: true },
              { label: 'Admin Vetting', desc: 'In Review', active: true, done: false },
              { label: 'Workspace Active', desc: 'Locked', active: false, done: false }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-all ${
                  step.done 
                    ? 'bg-accent border-accent text-white' 
                    : step.active 
                      ? 'bg-primary border-primary text-primary-foreground animate-pulse animate-duration-1000' 
                      : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-[10px] font-bold text-foreground mt-2">{step.label}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Application Vetting Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-7 h-7 text-amber-500 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Application Under Admin Review</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
            Thank you for registering <strong className="text-foreground">{companyName}</strong>. Our operations team is currently validating your municipal EPC bond credentials and contractor license (<code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{profile.license}</code>).
          </p>

          <div className="bg-muted/50 rounded-xl p-4 border border-border text-xs text-left space-y-2.5 max-w-md mx-auto">
            <p className="font-bold text-foreground flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary animate-pulse" /> Simulation Walkthrough & Quick Testing:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-muted-foreground leading-relaxed">
              <li>You simulated this installer signup on the <strong>Admin Dashboard</strong>.</li>
              <li>To approve this request, click the profile user avatar and sign out.</li>
              <li>Log back in as the <strong>Alex Vance (Admin)</strong> profile.</li>
              <li>Go to <strong>Manage Partners</strong> &gt; <strong>Installers</strong>.</li>
              <li>Click <strong>Verify Credentials</strong> on the <strong>{companyName}</strong> request card and approve it.</li>
              <li>Impersonate or log back in as this installer to view the workspace fully active!</li>
            </ol>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/dashboard/profile')}
              className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold transition-colors"
            >
              Edit Business Profile
            </button>
            <button
              onClick={() => {
                login(null as any);
                localStorage.removeItem('solarphase_user');
                navigate('/login');
                toast.info('Signed out. Log in as Admin to proceed.');
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-xs shadow-md transition-colors"
            >
              Sign Out & Verify as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Save profile credentials
  const saveProfile = () => {
    updateUser({ company: profile.company });
    toast.success('Business credentials updated successfully.');
  };

  // Submit quote bid price
  const handleSubmitBid = (leadId: number) => {
    const priceStr = bidPrices[leadId];
    if (!priceStr || isNaN(parseInt(priceStr))) {
      toast.error('Please input a valid numeric bid price.');
      return;
    }

    const allLeads = db.getLeads();
    const updatedLeads = allLeads.map(l => {
      if (l.id === leadId) {
        return { ...l, status: 'Accepted' as const, quotePrice: priceStr };
      }
      return l;
    });

    db.saveLeads(updatedLeads);
    setLeads(updatedLeads.filter(l => l.status === 'Pending' || l.status === 'Accepted'));
    toast.success(`Bid submitted: $${parseInt(priceStr).toLocaleString()} sent to customer!`);
    
    // Auto sync dashboard state and notify siblings
    syncData();
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Decline lead
  const handleDeclineLead = (leadId: number) => {
    const allLeads = db.getLeads();
    const updatedLeads = allLeads.map(l => {
      if (l.id === leadId) {
        return { ...l, status: 'Declined' as const };
      }
      return l;
    });
    db.saveLeads(updatedLeads);
    setLeads(updatedLeads);
    toast.info('Lead proposal declined.');
    syncData();
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Increment project status
  const handleUpdateProjectStage = (projId: number) => {
    const stages = ['Site Survey', 'Design', 'Permits', 'Installation', 'Commissioning', 'Active'] as const;
    const allProjects = db.getProjects();
    const targetProj = allProjects.find(p => p.id === projId);
    if (!targetProj) return;

    const currentIdx = stages.indexOf(targetProj.status as any);
    const nextIdx = Math.min(stages.length - 1, currentIdx + 1);
    const nextStatus = stages[nextIdx];
    const nextComp = Math.round(((nextIdx + 1) / stages.length) * 100);

    const updated = allProjects.map(p => {
      if (p.id === projId) {
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
    setProjects(updated);
    toast.success(`Project stage advanced to "${nextStatus}".`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Toggle checklist checkbox
  const handleToggleChecklist = (projId: number, itemIdx: number) => {
    const allProjects = db.getProjects();
    const updated = allProjects.map(p => {
      if (p.id === projId && p.checklist) {
        const list = [...p.checklist];
        list[itemIdx] = { ...list[itemIdx], done: !list[itemIdx].done };
        
        // Calculate completion based on checklist items done
        const doneCount = list.filter(item => item.done).length;
        const compPct = Math.round((doneCount / list.length) * 100);

        return {
          ...p,
          checklist: list,
          completion: compPct
        };
      }
      return p;
    });

    db.saveProjects(updated);
    setProjects(updated);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Assign Technician to Maintenance request
  const handleAssignTechnician = (ticketId: number, techName: string) => {
    if (!techName) return;
    const allReqs = db.getServiceRequests();
    const updated = allReqs.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'In Progress' as const,
          technician: techName
        };
      }
      return t;
    });

    db.saveServiceRequests(updated);
    setMaintenanceTickets(updated);
    toast.success(`Technician ${techName} assigned to service call ticket #${ticketId}.`);
    syncData();
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Direct redirection to installation checklist
  const handleLoadChecklist = (projId: number) => {
    setActiveProjectId(projId);
    localStorage.setItem('solarphase_installer_active_project_id', projId.toString());
    toast.success('Loading installation checklist requirements...');
    navigate('/dashboard/install');
  };

  // Simulation Helpers
  const simulateQuoteRequest = () => {
    const names = ['Emma Watson', 'Liam Neeson', 'Sophia Loren', 'Lucas Scott'];
    const sizes = ['7.5 kW', '9.2 kW', '6.0 kW', '12.4 kW'];
    const budgets = ['$15,000–$18,000', '$19,000–$23,000', '$12,000–$15,000', '$25,000–$30,000'];
    const locations = ['San Jose, CA', 'San Francisco, CA', 'Berkeley, CA', 'San Mateo, CA'];
    
    const randomIdx = Math.floor(Math.random() * names.length);
    const lead = db.addLead({
      customer: names[randomIdx],
      size: sizes[randomIdx],
      location: locations[randomIdx],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      budget: budgets[randomIdx]
    });
    
    syncData();
    toast.success(`Simulation: Homeowner ${lead.customer} requested a custom solar quote!`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  const simulateMaintenanceTicket = () => {
    const names = ['Michael Chang', 'Sarah Connor', 'Peter Parker'];
    const types = ['Inverter degradation', 'Panel cleaning', 'Wiring warning'];
    const descriptions = [
      'Inverter reporting 15% degraded daily efficiency. Diagnostics code E14.',
      'Heavy debris and dust build-up on roof array.',
      'System reporting ground fault alarm. Action required.'
    ];
    const priorities = ['Medium', 'Low', 'High'] as const;

    const randomIdx = Math.floor(Math.random() * names.length);
    db.addServiceRequest({
      customer: names[randomIdx],
      location: 'Bay Area, CA',
      priority: priorities[randomIdx],
      type: types[randomIdx],
      notes: descriptions[randomIdx]
    });
    
    syncData();
    toast.success(`Simulation: Homeowner ${names[randomIdx]} submitted a new service request!`);
    window.dispatchEvent(new Event('solarphase_data_updated'));
  };

  // Select project checklist
  const selectedProject = projects.find(p => p.id === activeProjectId) || projects.find(p => p.status !== 'Active') || projects[0];

  // Dynamic statistics graphs data
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 62000 },
    { month: 'Mar', revenue: 58000 },
    { month: 'Apr', revenue: 79000 },
    { month: 'May', revenue: 95000 },
    { month: 'Jun', revenue: 110000 },
  ];

  const pipelineData = [
    { stage: 'Survey', count: projects.filter(p => p.status === 'Site Survey').length },
    { stage: 'Design', count: projects.filter(p => p.status === 'Design').length },
    { stage: 'Permits', count: projects.filter(p => p.status === 'Permits').length },
    { stage: 'Install', count: projects.filter(p => p.status === 'Installation').length },
    { stage: 'Commission', count: projects.filter(p => p.status === 'Commissioning').length },
    { stage: 'Active', count: projects.filter(p => p.status === 'Active').length }
  ];

  // 1. VIEW: BUSINESS PROFILE
  if (view === 'profile') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Contractor Profile</h2>
        <p className="text-xs text-muted-foreground mb-6">Manage company certifications and geographical solar service zones.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2">Company Legal Entity Name</label>
            <input
              type="text"
              value={profile.company}
              onChange={e => setProfile(p => ({ ...p, company: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">EPC License Certificate / Bond Number</label>
            <input
              type="text"
              value={profile.license}
              onChange={e => setProfile(p => ({ ...p, license: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">Active Service Zones (State / Counties)</label>
            <input
              type="text"
              value={profile.area}
              onChange={e => setProfile(p => ({ ...p, area: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={saveProfile}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md text-sm"
          >
            Save Contractor Credentials
          </button>
        </div>
      </div>
    </div>
  );

  // 2. VIEW: LEADS
  if (view === 'leads') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-lg mb-1">Receive Residential Leads</h2>
          <p className="text-xs text-muted-foreground">Submit custom installation quotes to customer prospects looking to adopt solar panels.</p>
        </div>
        <button
          onClick={simulateQuoteRequest}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Quote Request
        </button>
      </div>

      <div className="space-y-3">
        {leads.map(lead => (
          <div key={lead.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground">{lead.customer}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${lead.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : lead.status === 'Accepted' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-destructive/10 text-destructive'}`}>
                    {lead.status === 'Pending' ? 'Awaiting Quote' : lead.status === 'Accepted' ? 'Quoted / Accepted' : 'Declined'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Desired system size: <span className="font-semibold text-primary">{lead.size}</span> · Location: {lead.location}</p>
                <p className="text-xs text-muted-foreground">Budget Envelope: <span className="font-semibold text-foreground">{lead.budget}</span> · Posted: {lead.date}</p>
              </div>

              {lead.status === 'Pending' && (
                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">$</span>
                    <input
                      type="number"
                      placeholder="Enter Bid Price"
                      value={bidPrices[lead.id] || ''}
                      onChange={e => setBidPrices(p => ({ ...p, [lead.id]: e.target.value }))}
                      className="w-40 pl-6 pr-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => handleSubmitBid(lead.id)}
                    className="p-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors shadow-sm"
                    title="Submit Price Proposal"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeclineLead(lead.id)}
                    className="p-2 bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
                    title="Decline Lead"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {lead.status === 'Accepted' && (
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-muted-foreground font-semibold block">Submitted Quote Price</span>
                  <p className="font-black text-base text-primary mt-0.5">${parseInt(lead.quotePrice || '0').toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-sm">No active homeowner leads</p>
            <p className="text-xs text-muted-foreground mt-1">Click the "Simulate Quote Request" button to mock homeowner solicitations.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 3. VIEW: MANAGE PROJECTS
  if (view === 'projects') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Active Installation Pipeline</h2>
        <p className="text-xs text-muted-foreground">Track structural designs, municipal permitting stages, and panel installations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-foreground text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Customer: {p.customer} · Target Commissioning Date: {p.date}</p>
              </div>
              <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full uppercase tracking-wider ${
                p.status === 'Active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {p.status}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-muted-foreground font-semibold">Total Progress</span>
                <span className="font-bold text-primary">{p.completion}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${p.completion}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-4 justify-between">
              <button
                onClick={() => handleLoadChecklist(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-semibold transition-colors"
              >
                <Eye className="w-4 h-4" /> Load Install Checklist
              </button>
              <button
                onClick={() => handleUpdateProjectStage(p.id)}
                disabled={p.status === 'Active'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Advance Pipeline Stage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. VIEW: INSTALL SYSTEMS
  if (view === 'install') return (
    <div className="max-w-2xl space-y-6">
      {selectedProject ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
            <div>
              <h2 className="font-bold text-lg">{selectedProject.name} checklist</h2>
              <p className="text-xs text-muted-foreground mt-0.5">EPC Step: <span className="text-primary font-bold">{selectedProject.status}</span></p>
            </div>
            <span className="text-sm font-black text-primary">{selectedProject.completion}%</span>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            EPC solar technicians must confirm mechanical, grounding, and wiring compliance steps.
          </p>

          <div className="space-y-2">
            {selectedProject.checklist?.map((item, i) => (
              <button
                key={i}
                onClick={() => handleToggleChecklist(selectedProject.id, i)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${item.done ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary/50'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-accent border-accent' : 'border-border'}`}>
                  {item.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-xs font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (selectedProject.checklist?.every(c => c.done)) {
                toast.success('Solar installation verified! System commissioning has completed. Generating telemetry feeds.');
                const updated = projects.map(p => p.id === selectedProject.id ? { ...p, status: 'Active' as const, completion: 100 } : p);
                db.saveProjects(updated);
                setProjects(updated);
                window.dispatchEvent(new Event('solarphase_data_updated'));
              } else {
                toast.error('All installation checklist compliance parameters must be checked.');
              }
            }}
            className="mt-6 w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm shadow-md"
          >
            Mark Installation Commissioned
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <HardHat className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-bold text-sm">Select an active project</p>
          <p className="text-xs text-muted-foreground mt-1">Open the Projects tab and click "Load Checklist" to verify install checks.</p>
        </div>
      )}
    </div>
  );

  // 5. VIEW: MAINTENANCE
  if (view === 'maintenance') return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-lg mb-1">Maintenance Dispatches</h2>
          <p className="text-xs text-muted-foreground">Assign technician engineers to customer service tickets.</p>
        </div>
        <button
          onClick={simulateMaintenanceTicket}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Support Ticket
        </button>
      </div>

      <div className="space-y-3">
        {maintenanceTickets.map(ticket => (
          <div key={ticket.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{ticket.customer}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  ticket.priority === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-muted text-muted-foreground'
                }`}>{ticket.priority} Priority</span>
              </div>
              <p className="text-xs font-semibold text-primary">{ticket.type}</p>
              <p className="text-xs text-muted-foreground leading-normal max-w-lg mt-1">{ticket.notes}</p>
              {ticket.technician && <p className="text-[10px] text-accent font-semibold mt-1">Assigned Field Tech: {ticket.technician}</p>}
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 justify-between md:justify-end flex-shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-secondary/10 text-secondary' : ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                {ticket.status}
              </span>

              {ticket.status === 'Open' && (
                <select
                  onChange={e => handleAssignTechnician(ticket.id, e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-semibold"
                >
                  <option value="">Assign Tech</option>
                  <option value="Mike Torres">Mike Torres</option>
                  <option value="Sandra Lee">Sandra Lee</option>
                  <option value="Dave Park">Dave Park</option>
                </select>
              )}
            </div>
          </div>
        ))}

        {maintenanceTickets.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-sm">No maintenance requests</p>
            <p className="text-xs text-muted-foreground mt-1">Click the "Simulate Support Ticket" button to test technician dispatches.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 6. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Leads', value: `${leads.filter(l => l.status === 'Pending').length}`, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Installation Pipeline', value: `${projects.filter(p => p.status !== 'Active').length}`, icon: FolderOpen, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Completed Systems', value: `${projects.filter(p => p.status === 'Active').length}`, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Annual Revenue YTD', value: `$${(840000 + projects.filter(p => p.status === 'Active').length * 15000).toLocaleString()}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Pipeline Breakdown Bar Chart */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Installation Pipeline Stages</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Active Projects" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Revenue growth area chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Contractor Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="installerRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2} fill="url(#installerRev)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Project List Table */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">Active Projects Quick Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border pb-2 text-muted-foreground font-semibold">
                <th className="py-2">Project</th>
                <th className="py-2">Client</th>
                <th className="py-2">Progress</th>
                <th className="py-2">Phase</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-semibold text-foreground">{p.name}</td>
                  <td className="py-3 text-muted-foreground">{p.customer}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${p.completion}%` }} />
                      </div>
                      <span className="font-bold text-foreground">{p.completion}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                      p.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleLoadChecklist(p.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Checklist <ArrowRight className="w-3 h-3" />
                    </button>
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
