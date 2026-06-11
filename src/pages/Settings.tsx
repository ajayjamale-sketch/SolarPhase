import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Bell, Shield, Globe, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    productionReports: true,
    maintenanceReminders: true,
    financingUpdates: false,
    newsletterUpdates: false,
  });
  const [privacy, setPrivacy] = useState({
    shareAnonymousData: true,
    showProfilePublicly: false,
  });
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (authLoading) return;
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, authLoading, navigate]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Settings saved successfully.');
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-32">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sun className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold">Appearance</h2>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">Currently using {theme} mode</p>
              </div>
              <button
                onClick={() => { toggleTheme(); toast.info(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode.`); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground mt-0.5">Platform display language</p>
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <Toggle checked={notifications.emailAlerts} onChange={v => setNotifications(p => ({ ...p, emailAlerts: v }))} label="System performance alerts via email" />
            <Toggle checked={notifications.productionReports} onChange={v => setNotifications(p => ({ ...p, productionReports: v }))} label="Monthly production reports" />
            <Toggle checked={notifications.maintenanceReminders} onChange={v => setNotifications(p => ({ ...p, maintenanceReminders: v }))} label="Maintenance reminders" />
            <Toggle checked={notifications.financingUpdates} onChange={v => setNotifications(p => ({ ...p, financingUpdates: v }))} label="Financing rate change notifications" />
            <Toggle checked={notifications.newsletterUpdates} onChange={v => setNotifications(p => ({ ...p, newsletterUpdates: v }))} label="SolarPhase product updates newsletter" />
          </div>

          {/* Privacy */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-semibold">Privacy</h2>
            </div>
            <Toggle checked={privacy.shareAnonymousData} onChange={v => setPrivacy(p => ({ ...p, shareAnonymousData: v }))} label="Share anonymous usage data to improve SolarPhase" />
            <Toggle checked={privacy.showProfilePublicly} onChange={v => setPrivacy(p => ({ ...p, showProfilePublicly: v }))} label="Show my profile in installer directory" />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
