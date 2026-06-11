import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Eye, EyeOff, ArrowRight, Users, Home, Building2,
  HardHat, Wrench, DollarSign, BarChart3, Shield, X, Phone, ChevronRight
} from 'lucide-react';
import { loginUser, loginAsDemo } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserRole } from '@/types';

const ROLES: { role: UserRole; icon: React.ElementType; desc: string; color: string }[] = [
  { role: 'Residential Customer', icon: Home, desc: 'Homeowner monitoring solar system', color: 'text-primary' },
  { role: 'Commercial Business', icon: Building2, desc: 'Business energy management', color: 'text-secondary' },
  { role: 'Solar Installer', icon: HardHat, desc: 'EPC contractor managing projects', color: 'text-primary' },
  { role: 'Maintenance Technician', icon: Wrench, desc: 'Field service engineer', color: 'text-accent' },
  { role: 'Financing Partner', icon: DollarSign, desc: 'Lender reviewing applications', color: 'text-secondary' },
  { role: 'Enterprise Energy Manager', icon: BarChart3, desc: 'Multi-site energy oversight', color: 'text-primary' },
  { role: 'Admin', icon: Shield, desc: 'Platform administrator', color: 'text-destructive' },
];

function RoleSelectModal({ onSelect, onClose }: { onSelect: (role: UserRole) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Select Demo Role</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose a user type to explore their dashboard</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map(({ role, icon: Icon, desc, color }) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">{role}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [tab, setTab] = useState<'email' | 'otp'>('email');
  const [form, setForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ phone: '', otp: '', otpSent: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Please enter a valid email address';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const user = loginUser(form.email, form.password);
      login(user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  const handleSendOTP = () => {
    if (!otpForm.phone || otpForm.phone.length < 10) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    setOtpForm(p => ({ ...p, otpSent: true }));
    toast.success('OTP sent! Use 123456 for demo access.');
  };

  const handleOTPLogin = () => {
    if (otpForm.otp !== '123456') {
      toast.error('Invalid OTP. Use 123456 for demo.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = loginUser(`user_${otpForm.phone}@solarphase.demo`, 'demo123456');
      login(user);
      toast.success('Logged in via OTP successfully!');
      navigate('/dashboard');
      setLoading(false);
    }, 700);
  };

  const handleDemoRole = (role: UserRole) => {
    setShowRoleModal(false);
    setLoading(true);
    setTimeout(() => {
      const user = loginAsDemo(role);
      login(user);
      toast.success(`Logged in as Demo ${role}`, { description: 'Demo mode active – all actions use mock data.' });
      navigate('/dashboard');
      setLoading(false);
    }, 600);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {showRoleModal && <RoleSelectModal onSelect={handleDemoRole} onClose={() => setShowRoleModal(false)} />}

      {/* Left visual panel */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-secondary/15 blur-3xl" />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 bg-white p-1">
            <img src="/logo.jpg" alt="SolarPhase Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Solar Intelligence Platform</h2>
          <p className="text-slate-300 max-w-sm leading-relaxed">
            Monitor your energy production, track savings, and optimize performance — all from one dashboard.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Active Users', value: '12,400+' },
              { label: 'kWh Monitored', value: '1.8M/day' },
              { label: 'CO2 Saved', value: '45,000 tons' },
              { label: 'Avg. Savings', value: '$247/mo' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-primary text-xl font-black">{stat.value}</p>
                <p className="text-slate-300 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>7 user roles, each with a dedicated workflow dashboard</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/logo.jpg" alt="SolarPhase Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
            <span className="font-bold text-xl">Solar<span className="text-primary">Phase</span></span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-6">Sign in to access your solar dashboard.</p>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-6 gap-1">
            {(['email', 'otp'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t === 'email' ? <Zap className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                {t === 'email' ? 'Email & Password' : 'Mobile OTP'}
              </button>
            ))}
          </div>

          {tab === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-muted border ${errors.email ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                />
                {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-muted border ${errors.password ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 text-base">
                {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : (<>Sign In <ArrowRight className="w-5 h-5" /></>)}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={otpForm.phone}
                    onChange={e => setOtpForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 555 000 0000"
                    className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={handleSendOTP} disabled={otpForm.otpSent} className="px-4 py-3 bg-secondary text-white font-medium rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 text-sm whitespace-nowrap">
                    {otpForm.otpSent ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
              </div>
              {otpForm.otpSent && (
                <div>
                  <label className="block text-sm font-medium mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otpForm.otp}
                    onChange={e => setOtpForm(p => ({ ...p, otp: e.target.value }))}
                    placeholder="Enter 6-digit OTP (demo: 123456)"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary tracking-widest text-center text-lg font-bold"
                  />
                  <button onClick={handleOTPLogin} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Verify & Login'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Skip credentials */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button
              onClick={() => setShowRoleModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary/10 text-secondary border border-secondary/30 font-semibold rounded-xl hover:bg-secondary/20 transition-all text-base"
            >
              <Users className="w-5 h-5" />
              Skip Credentials – Demo Access
            </button>
            <p className="text-center text-xs text-muted-foreground mt-2">Choose any of 7 user roles to explore the platform</p>
          </div>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            No account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
