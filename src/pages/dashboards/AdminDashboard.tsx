import { useState, useEffect } from 'react';
import {
  Users, FolderOpen, Building2, DollarSign, Search, PlusCircle, X,
  Shield, Check, UserPlus, Trash2, Power, TrendingUp, BarChart2
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

  // New User Form modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Residential Customer' });

  // Partner Verification lists
  const [installers, setInstallers] = useState([
    { id: 1, name: 'SunBuilders LLC', location: 'Bay Area, CA', status: 'Active', projects: 28 },
    { id: 2, name: 'BrightGrid Solar', location: 'Los Angeles, CA', status: 'Active', projects: 21 },
    { id: 3, name: 'EcoSun Contractors', location: 'Phoenix, AZ', status: 'Pending', projects: 0 },
    { id: 4, name: 'GreenVolt Inc.', location: 'Denver, CO', status: 'Active', projects: 15 },
  ]);

  const [financiers, setFinanciers] = useState([
    { id: 1, name: 'SunLoan Capital', location: 'New York, NY', status: 'Active', loans: 142 },
    { id: 2, name: 'GreenEnergy Finance', location: 'Austin, TX', status: 'Active', loans: 89 },
    { id: 3, name: 'CleanCredit Partners', location: 'Chicago, IL', status: 'Pending', loans: 0 },
  ]);

  useEffect(() => {
    // Load users and projects
    setUsers(db.getAdminUsers());
    setProjects(db.getProjects());
  }, [view]);

  // Toggle user suspension
  const handleToggleUserStatus = (id: number) => {
    const updated = users.map(u => {
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
    const u = users.find(user => user.id === id);
    if (!u) return;

    const updated = users.filter(user => user.id !== id);
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

    setUsers(prev => [...prev, created]);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', email: '', role: 'Residential Customer' });
    toast.success(`User account for ${created.name} provisioned.`);
  };

  // Verify Partner status
  const handleVerifyPartner = (id: number, type: 'installer' | 'financier') => {
    if (type === 'installer') {
      setInstallers(prev => prev.map(p => p.id === id ? { ...p, status: 'Active' } : p));
      toast.success('Solar contractor credentials verified and active.');
    } else {
      setFinanciers(prev => prev.map(p => p.id === id ? { ...p, status: 'Active' } : p));
      toast.success('Financing partner verified and active.');
    }
  };

  const adminRevenue = [
    { month: 'Jan', mrr: 48000 },
    { month: 'Feb', mrr: 52000 },
    { month: 'Mar', mrr: 58000 },
    { month: 'Apr', mrr: 63000 },
    { month: 'May', mrr: 71000 },
    { month: 'Jun', mrr: 79000 },
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
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-sm shadow-md"
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
                {['Project Name', 'Client Name', 'Status Stage', 'Completion Index'].map(h => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

      <div className="space-y-3">
        {(partnerTab === 'Installers' ? installers : financiers).map(p => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex justify-between items-center gap-4">
            <div>
              <p className="font-bold text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Location: {p.location} · Active Accounts: {'projects' in p ? p.projects : p.loans}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${p.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
                {p.status}
              </span>
              {p.status === 'Pending' && (
                <button
                  onClick={() => handleVerifyPartner(p.id, partnerTab === 'Installers' ? 'installer' : 'financier')}
                  className="px-3 py-1.5 bg-accent text-white font-semibold rounded-lg text-xs hover:bg-accent/90 shadow-sm"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Subscribed Clients', value: '12,418', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Projects', value: `${projects.length}`, icon: FolderOpen, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Verified Partners', value: `${installers.filter(i => i.status === 'Active').length + financiers.filter(f => f.status === 'Active').length}`, icon: Building2, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'MRR expansion', value: '$79K', icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
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
