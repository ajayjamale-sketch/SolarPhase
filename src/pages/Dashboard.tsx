import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Zap, Sun, Leaf, DollarSign, Activity, Settings, Bell, X,
  LayoutDashboard, FolderOpen, CreditCard, Menu, LogOut, User,
  TrendingUp, AlertTriangle, CheckCircle, Wrench, BarChart2,
  Home, Building2, HardHat, Shield, BarChart3, ChevronRight,
  Battery, MapPin, Star, Cpu, Upload, FileText, Users,
  ClipboardList, AlertCircle, Check, ChevronDown, Search,
  PlusCircle, Eye, RefreshCw, Download, ThumbsUp, ThumbsDown
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';
import { ENERGY_DATA } from '@/constants';
import { ChartSkeleton, CardSkeleton } from '@/components/features/Skeletons';
import Breadcrumbs from '@/components/features/Breadcrumbs';
import ScrollToTop from '@/components/features/ScrollToTop';
import { toast } from 'sonner';
import { UserRole } from '@/types';

// ─── Role nav configs ─────────────────────────────────────────────────────────
const ROLE_NAV: Record<UserRole, { id: string; label: string; icon: React.ElementType }[]> = {
  'Residential Customer': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assess', label: 'Solar Assessment', icon: Sun },
    { id: 'quotes', label: 'Request Quotes', icon: FileText },
    { id: 'install', label: 'Installation', icon: Home },
    { id: 'monitoring', label: 'Monitor Savings', icon: Activity },
    { id: 'impact', label: 'Env. Impact', icon: Leaf },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  'Commercial Business': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'usage', label: 'Energy Usage', icon: BarChart3 },
    { id: 'planning', label: 'Project Planning', icon: FolderOpen },
    { id: 'financing', label: 'Financing', icon: CreditCard },
    { id: 'roi', label: 'Monitor ROI', icon: TrendingUp },
    { id: 'optimize', label: 'Optimize', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  'Solar Installer': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'leads', label: 'Receive Leads', icon: Users },
    { id: 'projects', label: 'Manage Projects', icon: FolderOpen },
    { id: 'install', label: 'Install Systems', icon: HardHat },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  'Maintenance Technician': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Service Requests', icon: ClipboardList },
    { id: 'inspect', label: 'Inspect Systems', icon: Eye },
    { id: 'perform', label: 'Perform Maintenance', icon: Wrench },
    { id: 'reports', label: 'Update Reports', icon: FileText },
    { id: 'warranty', label: 'Warranty Tracking', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  'Financing Partner': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Loan Applications', icon: FileText },
    { id: 'approved', label: 'Approved Loans', icon: CheckCircle },
    { id: 'payments', label: 'Track Payments', icon: DollarSign },
    { id: 'reports', label: 'Generate Reports', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  'Enterprise Energy Manager': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sites', label: 'Monitor Sites', icon: MapPin },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'optimize', label: 'Optimize Usage', icon: Cpu },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  'Admin': [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'projects', label: 'Monitor Projects', icon: FolderOpen },
    { id: 'partners', label: 'Manage Partners', icon: Building2 },
    { id: 'revenue', label: 'Revenue & Growth', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
};

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  'Residential Customer': Home,
  'Commercial Business': Building2,
  'Solar Installer': HardHat,
  'Maintenance Technician': Wrench,
  'Financing Partner': DollarSign,
  'Enterprise Energy Manager': BarChart3,
  'Admin': Shield,
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { month: 'Jan', savings: 156 }, { month: 'Feb', savings: 178 }, { month: 'Mar', savings: 210 },
  { month: 'Apr', savings: 265 }, { month: 'May', savings: 310 }, { month: 'Jun', savings: 342 },
];

const ROI_DATA = [
  { year: 'Y1', savings: 2800, investment: 18000 }, { year: 'Y2', savings: 5600, investment: 18000 },
  { year: 'Y3', savings: 8700, investment: 18000 }, { year: 'Y4', savings: 12100, investment: 18000 },
  { year: 'Y5', savings: 15800, investment: 18000 },
];

const SITE_DATA = [
  { name: 'HQ', generation: 142, consumption: 128, co2: 64 },
  { name: 'Warehouse', generation: 89, consumption: 95, co2: 40 },
  { name: 'Factory', generation: 235, consumption: 198, co2: 106 },
];

const PAYMENT_DATA = [
  { month: 'Jan', scheduled: 42000, received: 42000 }, { month: 'Feb', scheduled: 44000, received: 43200 },
  { month: 'Mar', scheduled: 46000, received: 45800 }, { month: 'Apr', scheduled: 48000, received: 47100 },
  { month: 'May', scheduled: 50000, received: 50000 }, { month: 'Jun', scheduled: 52000, received: 51600 },
];

const ADMIN_REVENUE = [
  { month: 'Jan', mrr: 48000 }, { month: 'Feb', mrr: 52000 }, { month: 'Mar', mrr: 58000 },
  { month: 'Apr', mrr: 63000 }, { month: 'May', mrr: 71000 }, { month: 'Jun', mrr: 79000 },
];

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { view: viewParam } = useParams<{ view?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeView = viewParam || 'overview';

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    window.scrollTo(0, 0);
    setTimeout(() => setLoading(false), 800);
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeView]);

  const handleLogout = () => {
    logoutUser(); logout();
    toast.success('Signed out successfully.');
    navigate('/');
  };

  const navItems = user ? ROLE_NAV[user.role] : ROLE_NAV['Residential Customer'];
  const RoleIcon = user ? ROLE_ICONS[user.role] : Home;

  const getBreadcrumbs = () => {
    const base = [{ label: 'Dashboard', href: '/dashboard' }];
    const current = navItems.find(n => n.id === activeView);
    if (current && activeView !== 'overview') return [...base, { label: current.label }];
    return [{ label: 'Dashboard' }];
  };

  const navigate_view = (id: string) => {
    setSidebarOpen(false);
    navigate(`/dashboard/${id}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="SolarPhase Logo" className="w-7 h-7 rounded-lg object-contain shadow-sm" />
            <span className="font-bold">Solar<span className="text-primary">Phase</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl">
            <RoleIcon className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-primary truncate">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate_view(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id || (item.id === 'overview' && activeView === 'overview')
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">{user.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {user.isDemo && <span className="text-xs text-primary font-medium">Demo Mode</span>}
            </div>
          </div>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <User className="w-4 h-4" /> Profile
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Sun className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Today:</span>
              <span className="font-semibold text-accent">47.3 kWh generated</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.isDemo && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-secondary/10 text-secondary px-3 py-1.5 rounded-full border border-secondary/20">
                <Zap className="w-3 h-3" /> Demo Mode
              </span>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-primary" /> : <Zap className="w-5 h-5 text-muted-foreground" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Breadcrumbs items={getBreadcrumbs()} />
            <h1 className="text-2xl font-bold">
              {activeView === 'overview' ? `Welcome back, ${user.name.split(' ')[0]}` : navItems.find(n => n.id === activeView)?.label || activeView}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeView === 'overview' && `${user.role} Dashboard — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
              <ChartSkeleton />
            </div>
          ) : activeView === 'settings' ? (
            <DashboardSettings />
          ) : (
            <RoleDashboard role={user.role} view={activeView} />
          )}
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
}

// ─── Role dispatcher ──────────────────────────────────────────────────────────
function RoleDashboard({ role, view }: { role: UserRole; view: string }) {
  switch (role) {
    case 'Residential Customer': return <ResidentialDashboard view={view} />;
    case 'Commercial Business': return <CommercialDashboard view={view} />;
    case 'Solar Installer': return <InstallerDashboard view={view} />;
    case 'Maintenance Technician': return <TechnicianDashboard view={view} />;
    case 'Financing Partner': return <FinancingDashboard view={view} />;
    case 'Enterprise Energy Manager': return <EnterpriseDashboard view={view} />;
    case 'Admin': return <AdminDashboard view={view} />;
    default: return <ResidentialDashboard view={view} />;
  }
}

// ─── Inline Settings View ─────────────────────────────────────────────────────
function DashboardSettings() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [notifications, setNotifications] = useState({
    emailAlerts: true, productionReports: true, maintenanceReminders: true, financingUpdates: false, newsletterUpdates: false,
  });
  const [privacy, setPrivacy] = useState({ shareAnonymousData: true, showProfilePublicly: false });
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { toast.success('Settings saved successfully.'); setSaving(false); }, 700);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2"><Sun className="w-5 h-5 text-primary" /> Appearance</h2>
        <div className="flex items-center justify-between py-4 border-b border-border">
          <div><p className="text-sm font-medium">Theme</p><p className="text-xs text-muted-foreground mt-0.5">Currently using {theme} mode</p></div>
          <button onClick={() => { toggleTheme(); toast.info(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode.`); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
            {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Zap className="w-4 h-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="flex items-center justify-between py-4">
          <div><p className="text-sm font-medium">Language</p><p className="text-xs text-muted-foreground mt-0.5">Platform display language</p></div>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2"><Bell className="w-5 h-5 text-secondary" /> Notifications</h2>
        {([
          { key: 'emailAlerts', label: 'System performance alerts via email' },
          { key: 'productionReports', label: 'Monthly production reports' },
          { key: 'maintenanceReminders', label: 'Maintenance reminders' },
          { key: 'financingUpdates', label: 'Financing rate change notifications' },
          { key: 'newsletterUpdates', label: 'SolarPhase product updates newsletter' },
        ] as { key: keyof typeof notifications; label: string }[]).map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <span className="text-sm">{label}</span>
            <button onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2"><Shield className="w-5 h-5 text-accent" /> Privacy</h2>
        {([
          { key: 'shareAnonymousData', label: 'Share anonymous usage data to improve SolarPhase' },
          { key: 'showProfilePublicly', label: 'Show my profile in installer directory' },
        ] as { key: keyof typeof privacy; label: string }[]).map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <span className="text-sm">{label}</span>
            <button onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))} className={`relative w-11 h-6 rounded-full transition-colors ${privacy[key] ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${privacy[key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ─── Residential Dashboard ────────────────────────────────────────────────────
function ResidentialDashboard({ view }: { view: string }) {
  const [assessForm, setAssessForm] = useState({ roof: '', shade: '10', bill: '' });
  const [assessResult, setAssessResult] = useState<null | { score: number; size: string; savings: string }>(null);
  const [assessLoading, setAssessLoading] = useState(false);
  const [installSteps, setInstallSteps] = useState([
    { label: 'System Design', done: true },
    { label: 'Permits & Approvals', done: true },
    { label: 'Panel Installation', done: false },
    { label: 'Inverter Setup', done: false },
    { label: 'Grid Commissioning', done: false },
  ]);
  const [quotes, setQuotes] = useState([
    { id: 1, name: 'SunPower Pro Installers', rating: 4.9, price: '$16,800', sent: false },
    { id: 2, name: 'BrightGrid Solar LLC', rating: 4.7, price: '$15,400', sent: false },
    { id: 3, name: 'EcoSun Contractors', rating: 4.5, price: '$14,200', sent: false },
  ]);
  const [faultAlert, setFaultAlert] = useState(true);

  const handleAssess = () => {
    if (!assessForm.roof || !assessForm.bill) { toast.error('Please fill in roof area and monthly bill.'); return; }
    setAssessLoading(true);
    setTimeout(() => {
      setAssessResult({ score: 85, size: '5.4 kW', savings: '$2,940/year' });
      setAssessLoading(false);
      toast.success('Assessment complete! Your solar potential score is 85%.');
    }, 1400);
  };

  const sendQuote = (id: number) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, sent: true } : q));
    toast.success('Quote request sent to installer. You will hear back within 24 hours.');
  };

  const toggleInstallStep = (i: number) => {
    setInstallSteps(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], done: !updated[i].done };
      return updated;
    });
    toast.success('Installation progress updated.');
  };

  const doneCount = installSteps.filter(s => s.done).length;
  const progress = Math.round((doneCount / installSteps.length) * 100);

  if (view === 'assess') return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-4">AI Solar Potential Assessment</h2>
        <p className="text-muted-foreground text-sm mb-6">Enter your property details to receive an instant AI-powered solar feasibility score and system recommendation.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Roof Area (sq ft)</label>
              <input type="number" value={assessForm.roof} onChange={e => setAssessForm(p => ({ ...p, roof: e.target.value }))} placeholder="e.g. 1200" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shade Factor (%)</label>
              <select value={assessForm.shade} onChange={e => setAssessForm(p => ({ ...p, shade: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="5">Minimal shade (5%)</option>
                <option value="10">Light shade (10%)</option>
                <option value="20">Moderate shade (20%)</option>
                <option value="35">Heavy shade (35%)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Monthly Electricity Bill ($)</label>
            <input type="number" value={assessForm.bill} onChange={e => setAssessForm(p => ({ ...p, bill: e.target.value }))} placeholder="e.g. 180" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleAssess} disabled={assessLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            {assessLoading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><Sun className="w-5 h-5" /> Run AI Assessment</>}
          </button>
        </div>

        {assessResult && (
          <div className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <span className="text-2xl font-black text-white">{assessResult.score}%</span>
              </div>
              <div>
                <p className="font-bold text-lg text-accent">Solar Viable</p>
                <p className="text-sm text-muted-foreground">Recommended system: {assessResult.size}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-card rounded-lg p-3"><p className="text-muted-foreground">Est. Annual Savings</p><p className="font-bold text-accent">{assessResult.savings}</p></div>
              <div className="bg-card rounded-lg p-3"><p className="text-muted-foreground">Payback Period</p><p className="font-bold text-primary">6.1 years</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (view === 'quotes') return (
    <div className="max-w-2xl space-y-4">
      <p className="text-muted-foreground text-sm">3 vetted installers available in your area. Send a quote request to get detailed proposals.</p>
      {quotes.map(q => (
        <div key={q.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <HardHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{q.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(q.rating) ? 'text-primary fill-primary' : 'text-border'}`} />)}
                <span className="text-xs text-muted-foreground ml-1">{q.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-primary">{q.price}</span>
            <button onClick={() => sendQuote(q.id)} disabled={q.sent} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${q.sent ? 'bg-accent/10 text-accent cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
              {q.sent ? 'Request Sent' : 'Send Quote Request'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'install') return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Installation Progress</h2>
          <span className="text-sm font-bold text-primary">{progress}% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 mb-6">
          <div className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="space-y-3">
          {installSteps.map((step, i) => (
            <button key={i} onClick={() => toggleInstallStep(i)} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${step.done ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary hover:bg-primary/5'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${step.done ? 'bg-accent border-accent' : 'border-border'}`}>
                {step.done && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`font-medium text-sm ${step.done ? 'line-through text-muted-foreground' : ''}`}>{step.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === 'monitoring') return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Generated Today', value: '47.3 kWh', icon: Sun, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Saved Today', value: '$9.84', icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Monthly Savings', value: '$342', icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'System Health', value: '98.4%', icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-sm">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Energy Generation – Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={ENERGY_DATA}>
            <defs>
              <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Area type="monotone" dataKey="generation" stroke="#FACC15" strokeWidth={2} fill="url(#genGrad)" name="Generation (kWh)" />
            <Area type="monotone" dataKey="consumption" stroke="#2563EB" strokeWidth={2} fill="none" name="Consumption (kWh)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Monthly Savings – 2025</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Bar dataKey="savings" fill="#FACC15" radius={[6, 6, 0, 0]} name="Savings ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (view === 'impact') return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'CO2 Offset', value: '2,847 kg', icon: Leaf, color: 'text-accent', bg: 'bg-accent/10', sub: 'This year' },
          { label: 'Trees Equivalent', value: '134', icon: Sun, color: 'text-primary', bg: 'bg-primary/10', sub: 'Planted equivalent' },
          { label: 'Green Energy Score', value: '87/100', icon: Battery, color: 'text-secondary', bg: 'bg-secondary/10', sub: 'Excellent rating' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-3`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="font-medium mt-1 text-sm">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Annual CO2 Target Progress</h3>
          <span className="text-sm font-bold text-accent">71%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4">
          <div className="bg-gradient-to-r from-accent to-primary h-4 rounded-full" style={{ width: '71%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">2,847 kg of 4,000 kg annual target achieved</p>
      </div>
    </div>
  );

  // Overview
  return (
    <div className="space-y-6">
      {faultAlert && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Inverter efficiency at 94% — recommended inspection within 30 days.</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fault detection alert · 2 hours ago</p>
          </div>
          <button onClick={() => setFaultAlert(false)} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Sun, label: 'Generated Today', value: '47.3 kWh', sub: '+12% vs yesterday', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Leaf, label: 'CO2 Saved Today', value: '21.4 kg', sub: 'Equivalent to 2 trees', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: DollarSign, label: 'Saved This Month', value: '$342', sub: '$4,104 this year', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: Activity, label: 'System Health', value: '98.4%', sub: 'All systems nominal', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-5">Energy Production – Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ENERGY_DATA}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
              <Area type="monotone" dataKey="generation" stroke="#FACC15" strokeWidth={2} fill="url(#g1)" name="Generation (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Workflow Steps</h3>
          <div className="space-y-3">
            {[
              { label: 'Assess Solar Potential', status: 'Complete', href: 'assess' },
              { label: 'Request Installer Quotes', status: 'In Progress', href: 'quotes' },
              { label: 'Installation Tracker', status: '40%', href: 'install' },
              { label: 'Monitor Savings', status: 'Active', href: 'monitoring' },
              { label: 'Track Environmental Impact', status: 'Active', href: 'impact' },
            ].map((step, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm font-medium">{step.label}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${step.status === 'Complete' ? 'bg-accent/10 text-accent' : step.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Commercial Dashboard ─────────────────────────────────────────────────────
function CommercialDashboard({ view }: { view: string }) {
  const [emiCalc, setEmiCalc] = useState({ amount: '150000', rate: '6.5', tenure: '10' });
  const [emiResult, setEmiResult] = useState<number | null>(null);
  const [selectedSite, setSelectedSite] = useState('HQ');
  const [appliedRecos, setAppliedRecos] = useState<number[]>([]);

  const calcEMI = () => {
    const P = parseFloat(emiCalc.amount);
    const r = parseFloat(emiCalc.rate) / 100 / 12;
    const n = parseFloat(emiCalc.tenure) * 12;
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    setEmiResult(Math.round(emi));
  };

  const applyReco = (i: number) => {
    setAppliedRecos(prev => [...prev, i]);
    toast.success('Optimization recommendation applied to your energy schedule.');
  };

  const usageData = [
    { hour: '6am', usage: 42 }, { hour: '9am', usage: 87 }, { hour: '12pm', usage: 134 },
    { hour: '3pm', usage: 156 }, { hour: '6pm', usage: 98 }, { hour: '9pm', usage: 54 },
  ];

  if (view === 'usage') return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Energy Consumption Analysis</h2>
          <button onClick={() => toast.success('Usage data exported to CSV.')} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total This Month', value: '8,420 kWh', color: 'text-primary' },
            { label: 'Peak Demand', value: '156 kW', color: 'text-destructive' },
            { label: 'Solar Offset', value: '62%', color: 'text-accent' },
            { label: 'Grid Import', value: '3,200 kWh', color: 'text-muted-foreground' },
          ].map((s, i) => (
            <div key={i} className="bg-muted/50 rounded-xl p-4 text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Bar dataKey="usage" fill="#2563EB" radius={[6, 6, 0, 0]} name="Usage (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (view === 'planning') return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5">Multi-Site Solar Planning</h2>
        <div className="flex gap-2 mb-6">
          {['HQ', 'Warehouse', 'Factory'].map(site => (
            <button key={site} onClick={() => setSelectedSite(site)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedSite === site ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{site}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Roof Area', value: selectedSite === 'HQ' ? '8,400 sqft' : selectedSite === 'Warehouse' ? '22,000 sqft' : '15,600 sqft' },
            { label: 'Solar Potential', value: selectedSite === 'HQ' ? '180 kWp' : selectedSite === 'Warehouse' ? '440 kWp' : '320 kWp' },
            { label: 'Est. Generation', value: selectedSite === 'HQ' ? '216,000 kWh/yr' : selectedSite === 'Warehouse' ? '528,000 kWh/yr' : '384,000 kWh/yr' },
            { label: 'Est. Savings', value: selectedSite === 'HQ' ? '$32,400/yr' : selectedSite === 'Warehouse' ? '$79,200/yr' : '$57,600/yr' },
          ].map((item, i) => (
            <div key={i} className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="font-bold text-lg">{item.value}</p>
            </div>
          ))}
        </div>
        <button onClick={() => toast.success(`Solar project initiated for ${selectedSite}. A consultant will reach out within 2 business days.`)} className="mt-5 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          Initiate Project for {selectedSite}
        </button>
      </div>
    </div>
  );

  if (view === 'financing') return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5">EMI Calculator</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2">Loan Amount ($)</label>
              <input type="number" value={emiCalc.amount} onChange={e => setEmiCalc(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">Interest Rate (%)</label>
              <input type="number" step="0.1" value={emiCalc.rate} onChange={e => setEmiCalc(p => ({ ...p, rate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">Tenure (years)</label>
              <input type="number" value={emiCalc.tenure} onChange={e => setEmiCalc(p => ({ ...p, tenure: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
          </div>
          <button onClick={calcEMI} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">Calculate EMI</button>
          {emiResult && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 text-center">
              <p className="text-muted-foreground text-sm mb-1">Monthly EMI</p>
              <p className="text-4xl font-black text-accent">${emiResult.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">Total payable: ${(emiResult * parseFloat(emiCalc.tenure) * 12).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Available Subsidies</h3>
        <div className="space-y-3">
          {[
            { name: 'Federal ITC (30%)', amount: '$54,000', status: 'Eligible' },
            { name: 'USDA REAP Grant (40%)', amount: '$72,000', status: 'Check Eligibility' },
            { name: 'State Rebate Program', amount: '$12,000', status: 'Eligible' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">Up to {s.amount}</p></div>
              <button onClick={() => toast.success(`Subsidy application started for ${s.name}`)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${s.status === 'Eligible' ? 'bg-accent text-white hover:bg-accent/90' : 'bg-secondary text-white hover:bg-secondary/90'}`}>{s.status}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === 'roi') return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Payback Period', value: '6.4 years', color: 'text-primary', icon: TrendingUp },
          { label: 'IRR', value: '18.3%', color: 'text-accent', icon: BarChart3 },
          { label: '25-Year NPV', value: '$387,000', color: 'text-secondary', icon: DollarSign },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
            <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-3`} />
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">5-Year ROI Projection</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={ROI_DATA}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Area type="monotone" dataKey="savings" stroke="#16A34A" strokeWidth={2} fill="url(#savingsGrad)" name="Cumulative Savings ($)" />
            <Line type="monotone" dataKey="investment" stroke="#FACC15" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Investment ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (view === 'optimize') return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-muted-foreground text-sm">AI-generated optimization recommendations based on your consumption patterns and solar generation schedule.</p>
      {[
        { title: 'Shift machinery load to 11am–2pm', impact: '18% savings', detail: 'Peak solar generation window — run high-demand equipment during this period to maximize self-consumption.' },
        { title: 'Reduce HVAC setpoint by 2°F overnight', impact: '8% savings', detail: 'Night-time grid import can be reduced by pre-cooling the facility during peak solar hours.' },
        { title: 'Enable EV fleet charging at 12pm–3pm', impact: '12% savings', detail: 'Schedule all EV charging during peak solar generation to eliminate grid import costs.' },
        { title: 'Install demand response automation', impact: '22% savings', detail: 'Connect major loads to our smart controls for automatic load shifting based on real-time generation.' },
      ].map((r, i) => (
        <div key={i} className={`bg-card border rounded-2xl p-5 transition-all ${appliedRecos.includes(i) ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">{r.title}</p>
                <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{r.impact}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
            </div>
            <button
              onClick={() => !appliedRecos.includes(i) && applyReco(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${appliedRecos.includes(i) ? 'bg-accent/10 text-accent cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              {appliedRecos.includes(i) ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: BarChart3, label: 'Monthly Consumption', value: '8,420 kWh', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: DollarSign, label: 'Monthly Savings', value: '$1,248', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: TrendingUp, label: 'Solar Offset', value: '62%', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: Leaf, label: 'CO2 Reduced', value: '4.2 tons', color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Generation vs Consumption (Monthly)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={SITE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Bar dataKey="generation" fill="#FACC15" radius={[4, 4, 0, 0]} name="Generation (kWh)" />
            <Bar dataKey="consumption" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Installer Dashboard ──────────────────────────────────────────────────────
function InstallerDashboard({ view }: { view: string }) {
  const [leads, setLeads] = useState([
    { id: 1, customer: 'James Franklin', size: '6.2 kW', location: 'Austin, TX', date: 'Jun 8, 2025', budget: '$14,000–$18,000', status: 'Pending' as const },
    { id: 2, customer: 'Maria Santos', size: '8.4 kW', location: 'Denver, CO', date: 'Jun 9, 2025', budget: '$18,000–$24,000', status: 'Pending' as const },
    { id: 3, customer: 'Robert Kim', size: '4.8 kW', location: 'Phoenix, AZ', date: 'Jun 10, 2025', budget: '$11,000–$14,000', status: 'Pending' as const },
  ]);

  const [projects, setProjects] = useState([
    { id: 1, name: 'Franklin Residence', customer: 'James Franklin', status: 'Installation' as const, completion: 65, date: 'Jun 15' },
    { id: 2, name: 'Santos Commercial', customer: 'Maria Santos', status: 'Permits' as const, completion: 30, date: 'Jun 22' },
    { id: 3, name: 'Kim Residence', customer: 'Robert Kim', status: 'Site Survey' as const, completion: 10, date: 'Jul 1' },
  ]);

  const [installChecks, setInstallChecks] = useState([
    { label: 'Panels mounted and secured', done: false },
    { label: 'Inverter connected', done: false },
    { label: 'Wiring completed and inspected', done: false },
    { label: 'Grid sync verification', done: false },
    { label: 'System test and commissioning', done: false },
  ]);

  const [profile, setProfile] = useState({ company: 'SunBuilders LLC', license: 'CA-SOL-28491', area: 'Greater Bay Area, CA' });
  const [profileSaved, setProfileSaved] = useState(false);

  const handleLead = (id: number, action: 'Accepted' | 'Declined') => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
    toast.success(action === 'Accepted' ? 'Lead accepted. Customer notified.' : 'Lead declined.');
  };

  const updateProject = (id: number) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, completion: Math.min(p.completion + 20, 100) } : p));
    toast.success('Project progress updated successfully.');
  };

  const toggleInstallCheck = (i: number) => {
    setInstallChecks(prev => {
      const u = [...prev];
      u[i] = { ...u[i], done: !u[i].done };
      return u;
    });
  };

  const saveProfile = () => {
    setProfileSaved(true);
    toast.success('Business profile updated.');
    setTimeout(() => setProfileSaved(false), 3000);
  };

  if (view === 'profile') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5">Business Profile</h2>
        <div className="space-y-4">
          {[
            { label: 'Company Name', key: 'company', placeholder: 'Your company name' },
            { label: 'License Number', key: 'license', placeholder: 'e.g. CA-SOL-12345' },
            { label: 'Service Area', key: 'area', placeholder: 'e.g. Greater Bay Area, CA' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-2">{field.label}</label>
              <input
                type="text"
                value={profile[field.key as keyof typeof profile]}
                onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button onClick={saveProfile} className={`w-full py-3 font-semibold rounded-xl transition-colors ${profileSaved ? 'bg-accent text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
            {profileSaved ? 'Profile Saved' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );

  if (view === 'leads') return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{leads.filter(l => l.status === 'Pending').length} pending leads from residential customers.</p>
      {leads.map(lead => (
        <div key={lead.id} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">{lead.customer}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lead.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : lead.status === 'Accepted' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{lead.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{lead.size} system · {lead.location} · {lead.date}</p>
              <p className="text-xs text-muted-foreground mt-1">Budget: {lead.budget}</p>
            </div>
            {lead.status === 'Pending' && (
              <div className="flex gap-2">
                <button onClick={() => handleLead(lead.id, 'Accepted')} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Accept
                </button>
                <button onClick={() => handleLead(lead.id, 'Declined')} className="flex items-center gap-1.5 px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <ThumbsDown className="w-4 h-4" /> Decline
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'projects') return (
    <div className="space-y-4">
      {projects.map(p => (
        <div key={p.id} className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.customer} · Target: {p.date}</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0">{p.status}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-sm font-bold text-primary">{p.completion}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{ width: `${p.completion}%` }} />
          </div>
          <button onClick={() => updateProject(p.id)} disabled={p.completion >= 100} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <RefreshCw className="w-4 h-4" /> Update Progress
          </button>
        </div>
      ))}
    </div>
  );

  if (view === 'install') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-2">Installation Checklist</h2>
        <p className="text-sm text-muted-foreground mb-5">Franklin Residence — 6.2 kW System</p>
        <div className="space-y-3">
          {installChecks.map((item, i) => (
            <button key={i} onClick={() => toggleInstallCheck(i)} className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${item.done ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary/50'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-accent border-accent' : 'border-border'}`}>
                {item.done && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => {
          if (installChecks.every(c => c.done)) toast.success('All installation tasks completed! System is ready for commissioning.');
          else toast.error('Please complete all checklist items before marking as complete.');
        }} className="mt-5 w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors">
          Mark Installation Complete
        </button>
      </div>
    </div>
  );

  if (view === 'maintenance') return (
    <div className="space-y-4">
      {[
        { customer: 'Alice Wong', type: 'Panel Cleaning', date: 'Jun 15, 2025', priority: 'Low' },
        { customer: 'Bob Hernandez', type: 'Inverter Inspection', date: 'Jun 17, 2025', priority: 'High' },
        { customer: 'Carol Meyers', type: 'Annual Service', date: 'Jun 20, 2025', priority: 'Medium' },
      ].map((task, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">{task.customer}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{task.type} · {task.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${task.priority === 'High' ? 'bg-destructive/10 text-destructive' : task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>{task.priority}</span>
            <select onChange={() => toast.success('Technician assigned successfully.')} className="text-xs px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none cursor-pointer">
              <option value="">Assign Technician</option>
              <option>Mike Torres</option>
              <option>Sandra Lee</option>
              <option>Dave Park</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Users, label: 'Active Leads', value: '3', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: FolderOpen, label: 'Active Projects', value: '3', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: CheckCircle, label: 'Completed This Year', value: '28', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: DollarSign, label: 'Revenue YTD', value: '$742K', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Technician Dashboard ─────────────────────────────────────────────────────
function TechnicianDashboard({ view }: { view: string }) {
  const [requests, setRequests] = useState([
    { id: 1, customer: 'Paul Turner', location: 'San Jose, CA', priority: 'High', type: 'Inverter fault', status: 'Open' as const },
    { id: 2, customer: 'Lisa Monroe', location: 'Oakland, CA', priority: 'Medium', type: 'Panel shading issue', status: 'Open' as const },
    { id: 3, customer: 'Tom Walsh', location: 'Fremont, CA', priority: 'Low', type: 'Annual service', status: 'In Progress' as const },
  ]);
  const [inspectForm, setInspectForm] = useState({ panelHealth: 85, inverterReading: '4.2', notes: '' });
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { label: 'Clean solar panels (dry wipe)', done: false },
    { label: 'Check all wiring connections', done: false },
    { label: 'Verify inverter display readings', done: false },
    { label: 'Test battery connection (if applicable)', done: false },
    { label: 'Inspect mounting hardware', done: false },
  ]);
  const [reportNotes, setReportNotes] = useState('');

  const acceptRequest = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'In Progress' as const } : r));
    toast.success('Service request accepted. Added to your active tasks.');
  };

  const toggleTask = (i: number) => {
    setMaintenanceTasks(prev => { const u = [...prev]; u[i] = { ...u[i], done: !u[i].done }; return u; });
  };

  if (view === 'requests') return (
    <div className="space-y-4">
      {requests.map(r => (
        <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">{r.customer}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.priority === 'High' ? 'bg-destructive/10 text-destructive' : r.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>{r.priority}</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.type} · {r.location}</p>
              <span className={`text-xs mt-2 inline-block px-2.5 py-1 rounded-full font-medium ${r.status === 'Open' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>{r.status}</span>
            </div>
            {r.status === 'Open' && (
              <button onClick={() => acceptRequest(r.id)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0">Accept</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'inspect') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5">System Inspection Form</h2>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Panel Health</label>
              <span className="text-sm font-bold text-primary">{inspectForm.panelHealth}%</span>
            </div>
            <input type="range" min="0" max="100" value={inspectForm.panelHealth} onChange={e => setInspectForm(p => ({ ...p, panelHealth: parseInt(e.target.value) }))} className="w-full accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Inverter AC Reading (kW)</label>
            <input type="number" step="0.1" value={inspectForm.inverterReading} onChange={e => setInspectForm(p => ({ ...p, inverterReading: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Inspection Notes</label>
            <textarea rows={3} value={inspectForm.notes} onChange={e => setInspectForm(p => ({ ...p, notes: e.target.value }))} placeholder="Describe observations, findings..." className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <button onClick={() => toast.success('Inspection report submitted successfully.')} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            Submit Inspection
          </button>
        </div>
      </div>
    </div>
  );

  if (view === 'perform') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-2">Maintenance Tasks</h2>
        <p className="text-sm text-muted-foreground mb-5">Tom Walsh — Annual Service · Fremont, CA</p>
        <div className="space-y-3">
          {maintenanceTasks.map((t, i) => (
            <button key={i} onClick={() => toggleTask(i)} className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${t.done ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary/50'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-accent border-accent' : 'border-border'}`}>
                {t.done && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm ${t.done ? 'line-through text-muted-foreground' : 'font-medium'}`}>{t.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => toast.success('Maintenance task marked as completed.')} className="mt-5 w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors">
          Mark All Completed
        </button>
      </div>
    </div>
  );

  if (view === 'reports') return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5">Maintenance Report</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service Report Notes</label>
            <textarea rows={5} value={reportNotes} onChange={e => setReportNotes(e.target.value)} placeholder="Summarize work performed, parts replaced, recommendations..." className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Attach Files (optional)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => toast.info('File upload simulation — no files stored in demo mode.')}>
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload photos or documents</p>
            </div>
          </div>
          <button onClick={() => toast.success('Report generated and saved. PDF download started.', { description: 'Report #TEC-2025-0611 created.' })} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" /> Generate Report PDF
          </button>
        </div>
      </div>
    </div>
  );

  if (view === 'warranty') return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">Active warranties tracked for your assigned service area.</p>
      {[
        { customer: 'Paul Turner', component: 'SunPower SPR-X22 Panels (24)', expiry: 'Dec 15, 2047', daysLeft: 8221, status: 'Active' },
        { customer: 'Lisa Monroe', component: 'SolarEdge SE7600H Inverter', expiry: 'Mar 22, 2037', daysLeft: 4302, status: 'Active' },
        { customer: 'Tom Walsh', component: 'LG RESU10H Battery', expiry: 'Aug 5, 2035', daysLeft: 3707, status: 'Active' },
        { customer: 'Jenny Liu', component: 'Enphase IQ8 Microinverters (20)', expiry: 'Feb 28, 2035', daysLeft: 3548, status: 'Expiring Soon' },
      ].map((w, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">{w.customer}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{w.component}</p>
              <p className="text-xs text-muted-foreground mt-1">Expires: {w.expiry} ({w.daysLeft.toLocaleString()} days remaining)</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${w.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-600'}`}>{w.status}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: ClipboardList, label: 'Open Requests', value: '2', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Activity, label: 'In Progress', value: '1', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: CheckCircle, label: 'Completed This Month', value: '14', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: Shield, label: 'Active Warranties', value: '4', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Financing Dashboard ──────────────────────────────────────────────────────
function FinancingDashboard({ view }: { view: string }) {
  const [applications, setApplications] = useState([
    { id: 1, applicant: 'David Morrison', amount: 22000, creditScore: 748, systemSize: '8.4 kW', status: 'Pending' as const, date: 'Jun 9' },
    { id: 2, applicant: 'Rachel Green', amount: 15000, creditScore: 692, systemSize: '5.6 kW', status: 'Pending' as const, date: 'Jun 10' },
    { id: 3, applicant: 'Carlos Diaz', amount: 31000, creditScore: 803, systemSize: '11.2 kW', status: 'Approved' as const, date: 'Jun 7' },
    { id: 4, applicant: 'Amy Chen', amount: 18500, creditScore: 621, systemSize: '6.8 kW', status: 'Rejected' as const, date: 'Jun 6' },
  ]);

  const handleApp = (id: number, action: 'Approved' | 'Rejected') => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    toast.success(action === 'Approved' ? `Loan approved. Transaction ID: SP-${Date.now().toString().slice(-6)}` : 'Application rejected. Applicant notified.');
  };

  if (view === 'applications') return (
    <div className="space-y-4">
      {applications.map(app => (
        <div key={app.id} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              <div><p className="text-xs text-muted-foreground">Applicant</p><p className="font-semibold text-sm mt-0.5">{app.applicant}</p></div>
              <div><p className="text-xs text-muted-foreground">Loan Amount</p><p className="font-bold text-primary mt-0.5">${app.amount.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Credit Score</p><p className={`font-bold mt-0.5 ${app.creditScore >= 740 ? 'text-accent' : app.creditScore >= 680 ? 'text-yellow-600' : 'text-destructive'}`}>{app.creditScore}</p></div>
              <div><p className="text-xs text-muted-foreground">System</p><p className="font-medium text-sm mt-0.5">{app.systemSize}</p></div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {app.status === 'Pending' ? (
                <>
                  <button onClick={() => handleApp(app.id, 'Approved')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors">Approve</button>
                  <button onClick={() => handleApp(app.id, 'Rejected')} className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors">Reject</button>
                </>
              ) : (
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${app.status === 'Approved' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{app.status}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'approved') return (
    <div className="space-y-4">
      {applications.filter(a => a.status === 'Approved').map(app => (
        <div key={app.id} className="bg-card border border-accent/20 bg-accent/5 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{app.applicant}</p>
              <p className="text-sm text-muted-foreground">Loan: ${app.amount.toLocaleString()} · {app.systemSize} system</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium bg-accent/10 text-accent px-3 py-1 rounded-full">Funds Disbursed</span>
              <p className="text-xs text-muted-foreground mt-1">TXN: SP-{app.id}84729</p>
            </div>
          </div>
        </div>
      ))}
      {applications.filter(a => a.status === 'Approved').length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium">No approved loans yet</p>
          <p className="text-sm text-muted-foreground mt-1">Approve applications from the Loan Applications tab.</p>
        </div>
      )}
    </div>
  );

  if (view === 'payments') return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Scheduled vs Received Payments</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={PAYMENT_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
            <Bar dataKey="scheduled" fill="#2563EB" radius={[4, 4, 0, 0]} name="Scheduled ($)" />
            <Bar dataKey="received" fill="#16A34A" radius={[4, 4, 0, 0]} name="Received ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (view === 'reports') return (
    <div className="max-w-xl space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5">Portfolio Reports</h2>
        {[
          { title: 'Monthly Portfolio Summary', desc: 'Active loans, disbursements, collections · Jun 2025', type: 'PDF' },
          { title: 'Default Rate Analysis', desc: 'Risk metrics and default tracking · Q2 2025', type: 'PDF' },
          { title: 'Customer Credit Report', desc: 'Credit score distribution across portfolio', type: 'XLSX' },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 mb-3">
            <div>
              <p className="font-medium text-sm">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
            <button onClick={() => toast.success(`${r.title} downloaded as ${r.type}.`)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
              <Download className="w-3.5 h-3.5" /> {r.type}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: FileText, label: 'Pending Applications', value: `${applications.filter(a => a.status === 'Pending').length}`, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: CheckCircle, label: 'Approved Loans', value: `${applications.filter(a => a.status === 'Approved').length}`, color: 'text-accent', bg: 'bg-accent/10' },
          { icon: DollarSign, label: 'Portfolio Value', value: '$2.4M', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: TrendingUp, label: 'Collection Rate', value: '98.1%', color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Enterprise Dashboard ─────────────────────────────────────────────────────
function EnterpriseDashboard({ view }: { view: string }) {
  const [appliedSites, setAppliedSites] = useState<number[]>([]);

  const applyToSite = (i: number) => {
    setAppliedSites(prev => [...prev, i]);
    toast.success(`Optimization setpoints applied to ${SITE_DATA[i].name}.`);
  };

  if (view === 'sites') return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SITE_DATA.map((site, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
              <div><p className="font-semibold">{site.name}</p><span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">Online</span></div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Generation', value: `${site.generation} kWh`, color: 'text-primary' },
                { label: 'Consumption', value: `${site.consumption} kWh`, color: 'text-secondary' },
                { label: 'CO2 Saved', value: `${site.co2} kg`, color: 'text-accent' },
              ].map((m, j) => (
                <div key={j} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{m.label}</span>
                  <span className={`font-bold text-sm ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === 'performance') return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Generation vs Consumption by Site</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={SITE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Bar dataKey="generation" fill="#FACC15" radius={[4, 4, 0, 0]} name="Generation (kWh)" />
            <Bar dataKey="consumption" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Grid Export Trend (All Sites)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ENERGY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Line type="monotone" dataKey="export" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A34A' }} name="Grid Export (kWh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (view === 'optimize') return (
    <div className="space-y-4">
      {SITE_DATA.map((site, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{site.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Load shifting potential: {i === 0 ? '14%' : i === 1 ? '22%' : '31%'} savings available</p>
              <p className="text-xs text-muted-foreground mt-1">{i === 0 ? 'Shift HVAC loads to 10am-2pm window' : i === 1 ? 'Enable night-time battery discharge optimization' : 'Reschedule heavy machinery to peak solar window'}</p>
            </div>
            <button
              onClick={() => !appliedSites.includes(i) && applyToSite(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${appliedSites.includes(i) ? 'bg-accent/10 text-accent cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              {appliedSites.includes(i) ? 'Applied' : 'Apply to Site'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'sustainability') return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total CO2 Saved (YTD)', value: '284 tons', color: 'text-accent', icon: Leaf },
          { label: 'Renewable Energy %', value: '67%', color: 'text-primary', icon: Sun },
          { label: 'ESG Score', value: 'A+', color: 'text-secondary', icon: Star },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
            <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-3`} />
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sustainability Goal Progress</h3>
          <span className="text-sm font-bold text-accent">67%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 mb-2">
          <div className="bg-gradient-to-r from-accent to-primary h-4 rounded-full" style={{ width: '67%' }} />
        </div>
        <p className="text-xs text-muted-foreground">284 of 424 ton CO2 reduction target achieved for 2025</p>
        <button onClick={() => toast.success('ESG Report generated and ready for download.')} className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm">
          <Download className="w-4 h-4" /> Download ESG Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SITE_DATA.map((site, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><MapPin className="w-4 h-4 text-primary" /></div>
              <div><p className="font-semibold">{site.name}</p><span className="text-xs text-accent font-medium">Online</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Generation</span><span className="font-bold text-primary">{site.generation} kWh</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Consumption</span><span className="font-bold text-secondary">{site.consumption} kWh</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">CO2 Saved</span><span className="font-bold text-accent">{site.co2} kg</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Cross-Site Performance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={SITE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
            <Bar dataKey="generation" fill="#FACC15" radius={[4, 4, 0, 0]} name="Generation (kWh)" />
            <Bar dataKey="consumption" fill="#2563EB" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ view }: { view: string }) {
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'Elena Morrison', email: 'elena@solarhome.com', role: 'Residential Customer', status: 'Active' },
    { id: 2, name: 'James Okafor', email: 'james@brightgrid.com', role: 'Solar Installer', status: 'Active' },
    { id: 3, name: 'Priya Nair', email: 'priya@greenfinance.io', role: 'Financing Partner', status: 'Active' },
    { id: 4, name: 'Carlos Reyes', email: 'carlos@solarcorp.com', role: 'Commercial Business', status: 'Suspended' },
    { id: 5, name: 'Sophie Laurent', email: 'sophie@techteam.io', role: 'Maintenance Technician', status: 'Active' },
    { id: 6, name: 'Marcus Wei', email: 'marcus@enterprise.com', role: 'Enterprise Energy Manager', status: 'Active' },
  ]);

  const [projectFilter, setProjectFilter] = useState('All');
  const [partnerTab, setPartnerTab] = useState<'Installers' | 'Financiers'>('Installers');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    const user = users.find(u => u.id === id);
    toast.success(`User ${user?.status === 'Active' ? 'suspended' : 'activated'} successfully.`);
  };

  const deleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success(`User ${user?.name} removed from the platform.`);
  };

  const allProjects = [
    { customer: 'Elena Morrison', installer: 'SunBuilders LLC', status: 'Active', completion: 100 },
    { customer: 'James Okafor', installer: 'BrightGrid Solar', status: 'Installation', completion: 65 },
    { customer: 'Priya Nair', installer: 'EcoSun Contractors', status: 'Permits', completion: 30 },
    { customer: 'Carlos Reyes', installer: 'SunBuilders LLC', status: 'Design', completion: 15 },
    { customer: 'Sophie Laurent', installer: 'GreenVolt Inc.', status: 'Commissioning', completion: 90 },
  ];

  const filteredProjects = projectFilter === 'All' ? allProjects : allProjects.filter(p => p.status === projectFilter);

  if (view === 'users') return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium">{user.name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{user.role}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleUserStatus(user.id)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${user.status === 'Active' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}>
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Delete</button>
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

  if (view === 'projects') return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['All', 'Active', 'Installation', 'Permits', 'Design', 'Commissioning'].map(f => (
          <button key={f} onClick={() => setProjectFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${projectFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['Customer', 'Installer', 'Status', 'Completion'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map((p, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium">{p.customer}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{p.installer}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{p.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.completion}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.completion}%</span>
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

  if (view === 'partners') return (
    <div className="space-y-4">
      <div className="flex bg-muted rounded-xl p-1 gap-1 max-w-xs">
        {(['Installers', 'Financiers'] as const).map(t => (
          <button key={t} onClick={() => setPartnerTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${partnerTab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {(partnerTab === 'Installers' ? [
          { name: 'SunBuilders LLC', location: 'Bay Area, CA', status: 'Active', projects: 28 },
          { name: 'BrightGrid Solar', location: 'Los Angeles, CA', status: 'Active', projects: 21 },
          { name: 'EcoSun Contractors', location: 'Phoenix, AZ', status: 'Pending', projects: 0 },
          { name: 'GreenVolt Inc.', location: 'Denver, CO', status: 'Active', projects: 15 },
        ] : [
          { name: 'SunLoan Capital', location: 'New York, NY', status: 'Active', projects: 142 },
          { name: 'GreenEnergy Finance', location: 'Austin, TX', status: 'Active', projects: 89 },
          { name: 'CleanCredit Partners', location: 'Chicago, IL', status: 'Pending', projects: 0 },
        ]).map((p, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.location} · {p.projects} {partnerTab === 'Installers' ? 'projects' : 'loans'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-600'}`}>{p.status}</span>
              {p.status === 'Pending' ? (
                <button onClick={() => toast.success(`${p.name} approved as a verified partner.`)} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors">Approve</button>
              ) : (
                <button onClick={() => toast.success(`${p.name} has been suspended.`)} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium hover:bg-destructive/10 hover:text-destructive transition-colors">Suspend</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === 'revenue') return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'MRR (Jun 2025)', value: '$79,000', change: '+11%', color: 'text-primary' },
          { label: 'Total Users', value: '12,418', change: '+234 this month', color: 'text-secondary' },
          { label: 'Total Energy Monitored', value: '1.8M kWh/day', change: 'All systems', color: 'text-accent' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-accent mt-1">{s.change}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Monthly Recurring Revenue</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={ADMIN_REVENUE}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']} />
            <Area type="monotone" dataKey="mrr" stroke="#FACC15" strokeWidth={2.5} fill="url(#mrrGrad)" name="MRR ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Users, label: 'Total Users', value: '12,418', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: FolderOpen, label: 'Active Projects', value: '847', color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: Building2, label: 'Verified Partners', value: '142', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: DollarSign, label: 'MRR', value: '$79K', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-5">Platform Revenue Growth</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ADMIN_REVENUE}>
            <defs>
              <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']} />
            <Area type="monotone" dataKey="mrr" stroke="#FACC15" strokeWidth={2} fill="url(#adminGrad)" name="MRR ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
