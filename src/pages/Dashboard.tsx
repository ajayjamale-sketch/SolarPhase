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
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';
import { ChartSkeleton, CardSkeleton } from '@/components/features/Skeletons';
import Breadcrumbs from '@/components/features/Breadcrumbs';
import ScrollToTop from '@/components/features/ScrollToTop';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import logoUrl from '@/assets/logo.jpg';

// Import split dashboards
import ResidentialDashboard from '@/pages/dashboards/ResidentialDashboard';
import CommercialDashboard from '@/pages/dashboards/CommercialDashboard';
import InstallerDashboard from '@/pages/dashboards/InstallerDashboard';
import TechnicianDashboard from '@/pages/dashboards/TechnicianDashboard';
import FinancingDashboard from '@/pages/dashboards/FinancingDashboard';
import EnterpriseDashboard from '@/pages/dashboards/EnterpriseDashboard';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';

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

// ─── Main Dashboard Wrapper ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { view: viewParam } = useParams<{ view?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeView = viewParam || 'overview';

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    window.scrollTo(0, 0);
    setTimeout(() => setLoading(false), 500);
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
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
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="SolarPhase Logo" className="w-7 h-7 rounded-lg object-contain shadow-sm" />
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
                  ? 'bg-primary text-primary-foreground shadow-md font-semibold'
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Sun className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">Grid Status:</span>
              <span className="font-semibold text-accent">Active Harvest</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.isDemo && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-secondary/10 text-secondary px-3 py-1.5 rounded-full border border-secondary/20">
                <Zap className="w-3 h-3 animate-bounce" /> Demo Mode
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

// ─── Role Dispatcher ──────────────────────────────────────────────────────────
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
  
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('solarphase_settings_notifications');
      return stored ? JSON.parse(stored) : {
        emailAlerts: true, productionReports: true, maintenanceReminders: true, financingUpdates: false, newsletterUpdates: false,
      };
    } catch {
      return {
        emailAlerts: true, productionReports: true, maintenanceReminders: true, financingUpdates: false, newsletterUpdates: false,
      };
    }
  });

  const [privacy, setPrivacy] = useState(() => {
    try {
      const stored = localStorage.getItem('solarphase_settings_privacy');
      return stored ? JSON.parse(stored) : { shareAnonymousData: true, showProfilePublicly: false };
    } catch {
      return { shareAnonymousData: true, showProfilePublicly: false };
    }
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('solarphase_settings_language') || 'en';
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('solarphase_settings_notifications', JSON.stringify(notifications));
      localStorage.setItem('solarphase_settings_privacy', JSON.stringify(privacy));
      localStorage.setItem('solarphase_settings_language', language);
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
    setTimeout(() => { 
      toast.success('Settings saved successfully.'); 
      setSaving(false); 
    }, 700);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
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
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 text-sm">
          {saving ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
