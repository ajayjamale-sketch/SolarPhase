import { useState, useEffect } from 'react';
import {
  Users, FolderOpen, CheckCircle, DollarSign, Building2, Wrench, HardHat,
  ThumbsUp, ThumbsDown, RefreshCw, Check, Clock, Upload, ArrowRight, Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { db, Lead, Project, ServiceRequest } from '@/lib/dashboardStore';

export default function InstallerDashboard({ view }: { view: string }) {
  const { user, updateUser } = useAuth();

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
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  useEffect(() => {
    // Load leads, projects, maintenance
    setLeads(db.getLeads());
    setProjects(db.getProjects());
    setMaintenanceTickets(db.getServiceRequests());
  }, [view]);

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

    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return { ...l, status: 'Accepted' as const, quotePrice: priceStr };
      }
      return l;
    });

    db.saveLeads(updatedLeads);
    setLeads(updatedLeads);
    toast.success(`Bid submitted: $${parseInt(priceStr).toLocaleString()} sent to customer!`);
  };

  // Decline lead
  const handleDeclineLead = (leadId: number) => {
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return { ...l, status: 'Declined' as const };
      }
      return l;
    });
    db.saveLeads(updatedLeads);
    setLeads(updatedLeads);
    toast.info('Lead proposal declined.');
  };

  // Increment project status
  const handleUpdateProjectStage = (projId: number) => {
    const stages = ['Site Survey', 'Design', 'Permits', 'Installation', 'Commissioning', 'Active'] as const;
    const updated = projects.map(p => {
      if (p.id === projId) {
        const currentIdx = stages.indexOf(p.status as any);
        const nextIdx = Math.min(stages.length - 1, currentIdx + 1);
        const nextStatus = stages[nextIdx];
        const nextComp = Math.round(((nextIdx + 1) / stages.length) * 100);
        return {
          ...p,
          status: nextStatus,
          completion: nextStatus === 'Active' ? 100 : nextComp
        };
      }
      return p;
    });

    db.saveProjects(updated);
    setProjects(updated);
    toast.success('Project implementation stage advanced.');
  };

  // Toggle checklist checkbox
  const handleToggleChecklist = (projId: number, itemIdx: number) => {
    const updated = projects.map(p => {
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
  };

  // Assign Technician to Maintenance request
  const handleAssignTechnician = (ticketId: number, techName: string) => {
    if (!techName) return;
    const updated = maintenanceTickets.map(t => {
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
  };

  const selectedProject = projects.find(p => p.id === activeProjectId) || projects[0];

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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Receive Residential Leads</h2>
        <p className="text-xs text-muted-foreground">Submit custom installation quotes to customer prospects looking to adopt solar panels.</p>
      </div>

      <div className="space-y-3">
        {leads.map(lead => (
          <div key={lead.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground">{lead.customer}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${lead.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : lead.status === 'Accepted' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                    {lead.status === 'Pending' ? 'Awaiting Quote' : lead.status === 'Accepted' ? 'Quoted' : 'Declined'}
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
                      placeholder="Enter Quote Amount"
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
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">My Quoted Price</span>
                  <p className="font-bold text-sm text-primary">${parseInt(lead.quotePrice || '0').toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-sm">No leads available</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later for homeowner quote requests.</p>
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
              <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
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
                onClick={() => {
                  setActiveProjectId(p.id);
                  toast.success(`Checklist loaded for ${p.name}. Mark checklist items to advance progress.`);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                <Eye className="w-4 h-4" /> Load Checklist
              </button>
              <button
                onClick={() => handleUpdateProjectStage(p.id)}
                disabled={p.status === 'Active'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
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
                // Update project to Active
                const updated = projects.map(p => p.id === selectedProject.id ? { ...p, status: 'Active' as const, completion: 100 } : p);
                db.saveProjects(updated);
                setProjects(updated);
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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Maintenance Dispatches</h2>
        <p className="text-xs text-muted-foreground">Assign technician engineers to customer service tickets.</p>
      </div>

      <div className="space-y-3">
        {maintenanceTickets.map(ticket => (
          <div key={ticket.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{ticket.customer}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ticket.priority === 'High' ? 'bg-destructive/10 text-destructive' : ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>{ticket.priority} Priority</span>
              </div>
              <p className="text-xs font-semibold text-primary">{ticket.type}</p>
              <p className="text-xs text-muted-foreground leading-normal max-w-lg mt-1">{ticket.notes}</p>
              {ticket.technician && <p className="text-[10px] text-accent font-semibold mt-1">Assigned Field Tech: {ticket.technician}</p>}
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 justify-between md:justify-end flex-shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-secondary/10 text-secondary' : ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600' : 'bg-accent/10 text-accent'}`}>
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
            <p className="text-xs text-muted-foreground mt-1">Platform service systems report zero solar panel fault alarms.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 6. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Leads', value: `${leads.filter(l => l.status === 'Pending').length}`, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Installation Pipeline', value: `${projects.filter(p => p.status !== 'Active').length}`, icon: FolderOpen, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Completed Systems', value: `${projects.filter(p => p.status === 'Active').length}`, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Annual Revenue YTD', value: '$840,000', icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
