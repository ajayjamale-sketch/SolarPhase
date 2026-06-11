import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Zap, Sun, Moon, Leaf, DollarSign, Activity, Settings, Bell, X,
  LayoutDashboard, FolderOpen, CreditCard, Menu, LogOut, User,
  TrendingUp, AlertTriangle, CheckCircle, Wrench, BarChart2,
  Home, Building2, HardHat, Shield, BarChart3, ChevronRight,
  Battery, MapPin, Star, Cpu, Upload, FileText, Users,
  ClipboardList, AlertCircle, Check, ChevronDown, Search,
  PlusCircle, Eye, RefreshCw, Download, ThumbsUp, ThumbsDown,
  Camera, Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser, updateUserProfile } from '@/lib/auth';
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
  const [unreadCount, setUnreadCount] = useState(3);
  const [notificationList, setNotificationList] = useState<Array<{ id: number; text: string; time: string; type: 'info' | 'warning' | 'success' }>>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let list: Array<{ id: number; text: string; time: string; type: 'info' | 'warning' | 'success' }> = [];
    if (user.role === 'Residential Customer') {
      list = [
        { id: 1, text: 'Inverter operating at degraded output (94%).', time: '10m ago', type: 'warning' },
        { id: 2, text: 'Financing partner approved your loan application.', time: '2h ago', type: 'success' },
        { id: 3, text: 'New quote proposal received from SunBuilders LLC.', time: '1d ago', type: 'info' },
      ];
    } else if (user.role === 'Commercial Business') {
      list = [
        { id: 1, text: 'AI demand offset: optimal shift opportunity at 2 PM today.', time: '5m ago', type: 'info' },
        { id: 2, text: 'Rooftop engineering feasibility assessment signed.', time: '3h ago', type: 'success' },
        { id: 3, text: 'Green energy subsidy compliance validation pending.', time: '1d ago', type: 'warning' },
      ];
    } else if (user.role === 'Solar Installer') {
      list = [
        { id: 1, text: 'New high-priority lead received for 6.0 kW system.', time: '1h ago', type: 'success' },
        { id: 2, text: 'Technician Mike Torres submitted inspection checklist.', time: '4h ago', type: 'info' },
        { id: 3, text: 'Warranty tracking registration confirmed for project #104.', time: '2d ago', type: 'info' },
      ];
    } else if (user.role === 'Maintenance Technician') {
      list = [
        { id: 1, text: 'Urgent inverter under-voltage request assigned to you.', time: '15m ago', type: 'warning' },
        { id: 2, text: 'Work order approved for site safety inspection.', time: '1d ago', type: 'success' },
      ];
    } else if (user.role === 'Financing Partner') {
      list = [
        { id: 1, text: 'New FICO 720 loan application submitted by customer.', time: '1h ago', type: 'info' },
        { id: 2, text: 'Monthly disbursement transfer of $45,800 executed.', time: '5h ago', type: 'success' },
      ];
    } else if (user.role === 'Enterprise Energy Manager') {
      list = [
        { id: 1, text: 'Outage Alert: Facility #3 (Boston Hub) reported 0% generation.', time: '3m ago', type: 'warning' },
        { id: 2, text: 'ESG ESG target checklist reached 71% of yearly budget.', time: '2h ago', type: 'success' },
      ];
    } else if (user.role === 'Admin') {
      list = [
        { id: 1, text: 'EcoSun Contractors submitted new EPC registration request.', time: '30m ago', type: 'warning' },
        { id: 2, text: 'Monthly SaaS subscription MRR increased to $80,240.', time: '1d ago', type: 'success' },
      ];
    }
    setNotificationList(list);
    setUnreadCount(list.length);
  }, [user]);

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
          <Link to="/dashboard/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeView === 'profile' ? 'bg-primary text-primary-foreground shadow-md font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
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
              {theme === 'dark' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl py-3 z-50">
                    <div className="px-4 pb-2 border-b border-border flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => {
                            setUnreadCount(0);
                            toast.success('Marked all as read.');
                          }}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto mt-2">
                      {notificationList.map(n => (
                        <div 
                          key={n.id} 
                          className="px-4 py-2.5 hover:bg-muted/50 transition-colors flex gap-3 text-xs border-b border-border/40 last:border-0"
                        >
                          <div className="mt-0.5">
                            {n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : n.type === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-accent" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground font-medium">{n.text}</p>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                      {notificationList.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-center py-6">No new notifications.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
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
          ) : activeView === 'profile' ? (
            <DashboardProfile />
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
            {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}
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
          <div key={key as string} className="flex items-center justify-between py-3 border-b border-border last:border-0">
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
          <div key={key as string} className="flex items-center justify-between py-3 border-b border-border last:border-0">
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

// ─── Inline Profile View ──────────────────────────────────────────────────────
function DashboardProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', company: '', role: 'Residential Customer' as UserRole });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const ALL_ROLES: UserRole[] = [
    'Residential Customer', 'Commercial Business', 'Solar Installer',
    'Maintenance Technician', 'Financing Partner', 'Enterprise Energy Manager', 'Admin'
  ];

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        company: user.company || '',
        role: user.role
      });
    }
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSavingProfile(true);
    setTimeout(() => {
      const updated = updateUserProfile(form);
      updateUser(updated);
      toast.success('Profile updated successfully.');
      setSavingProfile(false);
    }, 800);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 px-8 py-10 relative overflow-hidden border-b border-border">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-center gap-6 relative">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-primary-foreground">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <span className="inline-block mt-2 text-xs bg-primary/25 border border-primary/30 text-primary px-3 py-1 rounded-full font-semibold">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-foreground">Edit Account Profile</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-muted border ${errors.name ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-1 focus:ring-primary`}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-muted border ${errors.email ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-1 focus:ring-primary`}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Company (Optional)</label>
              <input
                type="text"
                value={form.company}
                onChange={e => handleChange('company', e.target.value)}
                placeholder="Your company name"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Account Type</label>
              <select
                value={form.role}
                onChange={e => handleChange('role', e.target.value)}
                disabled={user?.isDemo}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {user?.isDemo && <p className="text-[10px] text-muted-foreground mt-1">Role is read-only in demo mode.</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 text-sm"
            >
              {savingProfile ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
