import { useState, useEffect } from 'react';
import {
  Users, FolderOpen, Building2, DollarSign, Search, PlusCircle, X,
  Shield, Check, UserPlus, Trash2, Power, TrendingUp, BarChart2, Eye, Sparkles, AlertCircle, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import { db, AdminUser, Project } from '@/lib/dashboardStore';

export default function AdminDashboard({ view }: { view: string }) {
  // Shared synchronized states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Local state
  const [userSearch, setUserSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [partnerTab, setPartnerTab] = useState<'Installers' | 'Financiers'>('Installers');

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Residential Customer' });
  const [auditProject, setAuditProject] = useState<Project | null>(null);

  // Persistent partner state databases
  const [installers, setInstallers] = useState(() => {
    try {
      const stored = localStorage.getItem('solarphase_admin_installers');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 1, name: 'SunBuilders LLC', location: 'Bay Area, CA', status: 'Active', projects: 28 },
      { id: 2, name: 'BrightGrid Solar', location: 'Los Angeles, CA', status: 'Active', projects: 21 },
      { id: 3, name: 'EcoSun Contractors', location: 'Phoenix, AZ', status: 'Pending', projects: 0 },
      { id: 4, name: 'GreenVolt Inc.', location: 'Denver, CO', status: 'Active', projects: 15 },
    ];
  });

  const [financiers, setFinanciers] = useState(() => {
    try {
      const stored = localStorage.getItem('solarphase_admin_financiers');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 1, name: 'SunLoan Capital', location: 'New York, NY', status: 'Active', loans: 142 },
      { id: 2, name: 'GreenEnergy Finance', location: 'Austin, TX', status: 'Active', loans: 89 },
      { id: 3, name: 'CleanCredit Partners', location: 'Chicago, IL', status: 'Pending', loans: 0 },
    ];
  });

  const syncData = () => {
    setUsers(db.getAdminUsers());
    setProjects(db.getProjects());
  };

  useEffect(() => {
    syncData();
  }, [view]);

  // Toggle user suspension
  const handleToggleUserStatus = (id: number) => {
    const allUsers = db.getAdminUsers();
    const updated = allUsers.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' as const : 'Active' as const;
        toast.success(`User account for ${u.name} is now ${nextStatus.toLowerCase()}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    });

    db.saveAdminUsers(updated);
    setUsers(updated);
  };

  // Delete user
  const handleDeleteUser = (id: number) => {
    const allUsers = db.getAdminUsers();
    const u = allUsers.find(user => user.id === id);
    if (!u) return;

    const updated = allUsers.filter(user => user.id !== id);
    db.saveAdminUsers(updated);
    setUsers(updated);
    toast.success(`User ${u.name} removed from registry.`);
  };

  // Create new user account
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      toast.error('Please enter name and email.');
      return;
    }

    const created = db.addAdminUser({
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
    });

    syncData();
    setShowAddUserModal(false);
    setNewUserForm({ name: '', email: '', role: 'Residential Customer' });
    toast.success(`User account for ${created.name} provisioned.`);
  };

  // Verify Partner status & persist in DB
  const handleVerifyPartner = (id: number, type: 'installer' | 'financier') => {
    if (type === 'installer') {
      const updated = installers.map(p => p.id === id ? { ...p, status: 'Active' } : p);
      setInstallers(updated);
      localStorage.setItem('solarphase_admin_installers', JSON.stringify(updated));
      toast.success('Solar contractor credentials verified and active.');
    } else {
      const updated = financiers.map(p => p.id === id ? { ...p, status: 'Active' } : p);
      setFinanciers(updated);
      localStorage.setItem('solarphase_admin_financiers', JSON.stringify(updated));
      toast.success('Financing partner verified and active.');
    }
  };

  // Simulate partner signup
  const simulatePartnerRegistration = () => {
    if (partnerTab === 'Installers') {
      const names = ['Apex Solar EPC', 'VoltAir Energy', 'Bay Solar Tech'];
      const locations = ['San Diego, CA', 'Seattle, WA', 'San Jose, CA'];
      const randomIdx = Math.floor(Math.random() * names.length);
      const newInst = {
        id: installers.length > 0 ? Math.max(...installers.map(i => i.id)) + 1 : 1,
        name: names[randomIdx],
        location: locations[randomIdx],
        status: 'Pending',
        projects: 0
      };
      const updated = [...installers, newInst];
      setInstallers(updated);
      localStorage.setItem('solarphase_admin_installers', JSON.stringify(updated));
      toast.success(`Simulation: Installer "${newInst.name}" submitted a registration request!`);
    } else {
      const names = ['Vanguard Green Funds', 'EcoEquity Partners', 'Horizon Lending Group'];
      const locations = ['Boston, MA', 'San Francisco, CA', 'Miami, FL'];
      const randomIdx = Math.floor(Math.random() * names.length);
      const newFin = {
        id: financiers.length > 0 ? Math.max(...financiers.map(f => f.id)) + 1 : 1,
        name: names[randomIdx],
        location: locations[randomIdx],
        status: 'Pending',
        loans: 0
      };
      const updated = [...financiers, newFin];
      setFinanciers(updated);
      localStorage.setItem('solarphase_admin_financiers', JSON.stringify(updated));
      toast.success(`Simulation: Financing Partner "${newFin.name}" submitted a registration request!`);
    }
  };

  // Dynamic statistics calculations
  const totalUsersCount = (users.length * 15) + 12000;
  const activeProjectsCount = projects.filter(p => p.status !== 'Active').length;
  const completedSystemsCount = projects.filter(p => p.status === 'Active').length;
  const dynamicMRR = 79000 + (users.length * 125) + (installers.filter(i => i.status === 'Active').length * 480);

  // Dynamic Charts datasets
  const roleCounts = {
    'Residential': users.filter(u => u.role === 'Residential Customer').length + 8,
    'Commercial': users.filter(u => u.role === 'Commercial Business').length + 4,
    'Installers': users.filter(u => u.role === 'Solar Installer').length + 6,
    'Techs': users.filter(u => u.role === 'Maintenance Technician').length + 5,
    'Lenders': users.filter(u => u.role === 'Financing Partner').length + 3,
    'Managers': users.filter(u => u.role === 'Enterprise Energy Manager').length + 2,
    'Admins': users.filter(u => u.role === 'Admin').length + 1,
  };

  const userRoleData = Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count
  }));

  const adminRevenue = [
    { month: 'Jan', mrr: 48000 },
    { month: 'Feb', mrr: 52000 },
    { month: 'Mar', mrr: 58000 },
    { month: 'Apr', mrr: 63000 },
    { month: 'May', mrr: 71000 },
    { month: 'Jun', mrr: dynamicMRR },
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProjects = projectFilter === 'All'
    ? projects
    : projects.filter(p => p.status === projectFilter);

  // 1. VIEW: MANAGE USERS
  if (view === 'users') return (
    <div className="space-y-4 max-w-6xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            placeholder="Search accounts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition-colors shadow-md flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Provision User Account
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/65">
              <tr>
                {['Name', 'Email Address', 'System Role', 'Status Badge', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-bold text-foreground">{u.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{u.role}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${u.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`font-semibold hover:underline flex items-center gap-1 ${u.status === 'Active' ? 'text-amber-500' : 'text-accent'}`}
                      >
                        <Power className="w-3.5 h-3.5" /> {u.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-destructive font-semibold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="font-bold text-lg flex items-center gap-1.5"><UserPlus className="w-5 h-5 text-primary" /> Create Account</h3>
              <button onClick={() => setShowAddUserModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sandra Bullock"
                  value={newUserForm.name}
                  onChange={e => setNewUserForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sandra@solarphase.com"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">System Access Level</label>
                <select
                  value={newUserForm.role}
                  onChange={e => setNewUserForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Residential Customer</option>
                  <option>Commercial Business</option>
                  <option>Solar Installer</option>
                  <option>Maintenance Technician</option>
                  <option>Financing Partner</option>
                  <option>Enterprise Energy Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md transition-colors"
              >
                Provision Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 2. VIEW: MONITOR PROJECTS
  if (view === 'projects') return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex bg-muted rounded-xl p-1 gap-1 max-w-md border border-border/40 overflow-x-auto">
        {['All', 'Site Survey', 'Design', 'Permits', 'Installation', 'Commissioning', 'Active'].map(f => (
          <button
            key={f}
            onClick={() => setProjectFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${projectFilter === f ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/65">
              <tr>
                {['Project Name', 'Client Name', 'Status Stage', 'Completion Index', 'Compliance Audit'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map((p, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-bold text-foreground">{p.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.customer}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] bg-primary/10 text-primary border border-primary/20">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.completion}%` }} />
                      </div>
                      <span className="font-bold text-[10px] text-muted-foreground">{p.completion}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setAuditProject(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Audit Checklist <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Audit Modal */}
      {auditProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="font-bold text-lg">{auditProject.name} Compliance Audit</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ecosystem tracking record ID: #{auditProject.id}</p>
              </div>
              <button onClick={() => setAuditProject(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Contractor Partner Check</span>
                <span className="font-bold text-foreground">SunBuilders LLC</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Active Status Stage</span>
                <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] bg-primary/10 text-primary border border-primary/20">
                  {auditProject.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-muted-foreground font-semibold">Total Progress Index</span>
                  <span className="font-bold text-primary">{auditProject.completion}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${auditProject.completion}%` }} />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold mb-3">Field Engineering Verification Checklist</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {auditProject.checklist && auditProject.checklist.length > 0 ? (
                    auditProject.checklist.map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                        item.done ? 'border-accent/25 bg-accent/5' : 'border-border bg-muted/20'
                      }`}>
                        <span className={`font-semibold ${item.done ? 'line-through text-muted-foreground font-normal' : 'text-foreground'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] font-bold ${item.done ? 'text-accent' : 'text-amber-500'}`}>
                          {item.done ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No checklist configured for this project structure.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 3. VIEW: MANAGE PARTNERS
  if (view === 'partners') return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex bg-muted rounded-xl p-1 gap-1 max-w-xs border border-border/40 mb-4">
        {(['Installers', 'Financiers'] as const).map(t => (
          <button
            key={t}
            onClick={() => setPartnerTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${partnerTab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="font-bold text-sm text-foreground">Partner Vetting Management</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Audit license verification queues and grant platform access tokens.</p>
        </div>
        <button
          onClick={simulatePartnerRegistration}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Simulate Partner Signup
        </button>
      </div>

      <div className="space-y-3">
        {(partnerTab === 'Installers' ? installers : financiers).map(p => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex justify-between items-center gap-4">
            <div>
              <p className="font-bold text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Location: {p.location} · Active Accounts: {'projects' in p ? p.projects : p.loans}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${p.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 animate-pulse'}`}>
                {p.status}
              </span>
              {p.status === 'Pending' && (
                <button
                  onClick={() => handleVerifyPartner(p.id, partnerTab === 'Installers' ? 'installer' : 'financier')}
                  className="px-3 py-1.5 bg-accent text-white font-semibold rounded-lg text-xs hover:bg-accent/90 shadow-sm transition-colors"
                >
                  Verify Credentials
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. VIEW: REVENUE
  if (view === 'revenue') return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> MRR Expansion</h2>
        <p className="text-xs text-muted-foreground mb-6">Platform recurring SaaS subscription volumes.</p>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={adminRevenue}>
            <defs>
              <linearGradient id="adminMrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="mrr" stroke="#FACC15" strokeWidth={2.5} fill="url(#adminMrrGrad)" name="Monthly SaaS Yield ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // 5. DEFAULT VIEW: OVERVIEW
  return (
    <div className="space-y-6">
      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Subscribed Clients', value: totalUsersCount.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Installation Pipeline', value: `${activeProjectsCount}`, icon: FolderOpen, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Completed Systems', value: `${completedSystemsCount}`, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Platform Expansion MRR', value: `$${dynamicMRR.toLocaleString()}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-xs font-semibold mb-1">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Interactive Distribution & MRR Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">User Access Level Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userRoleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="role" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Users Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Platform Revenue Expansion Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={adminRevenue}>
              <defs>
                <linearGradient id="adminRevenueOverviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              <Area type="monotone" dataKey="mrr" stroke="#16A34A" strokeWidth={2} fill="url(#adminRevenueOverviewGrad)" name="Monthly Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
