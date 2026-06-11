import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Building2, Home, HardHat, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserRole } from '@/types';

const ROLES: { role: UserRole; icon: React.ElementType; desc: string }[] = [
  { role: 'Residential Customer', icon: Home, desc: 'Homeowner going solar' },
  { role: 'Commercial Business', icon: Building2, desc: 'Business owner or manager' },
  { role: 'Solar Installer', icon: HardHat, desc: 'Contractor or EPC company' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Residential Customer' as UserRole });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Please enter your full name';
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
      const user = registerUser(form.name, form.email, form.password, form.role);
      login(user);
      toast.success(`Account created! Welcome to SolarPhase, ${user.name.split(' ')[0]}.`);
      navigate('/dashboard');
      setLoading(false);
    }, 900);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 bg-white p-1">
            <img src="/logo.jpg" alt="SolarPhase Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join 12,400+ Solar Users</h2>
          <p className="text-slate-300 leading-relaxed mb-8">Get your AI-powered solar assessment, monitor your system in real-time, and track every dollar saved.</p>
          <div className="space-y-4 text-left">
            {['Free AI solar potential assessment in 60 seconds', 'Real-time monitoring from day one', 'Compare financing from 40+ lenders', 'Track CO2 impact and sustainability goals'].map(item => (
              <div key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/logo.jpg" alt="SolarPhase Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
            <span className="font-bold text-xl">Solar<span className="text-primary">Phase</span></span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Free to start. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(({ role, icon: Icon, desc }) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setForm(p => ({ ...p, role }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${form.role === role ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}
                  >
                    <Icon className={`w-5 h-5 ${form.role === role ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Your full name"
                className={`w-full px-4 py-3 rounded-xl bg-muted border ${errors.name ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              />
              {errors.name && <p className="text-destructive text-xs mt-1.5">{errors.name}</p>}
            </div>

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
              <label className="block text-sm font-medium mb-2">Password</label>
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

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 text-base mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : (<>Create Account <ArrowRight className="w-5 h-5" /></>)}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3">
            By registering, you agree to our{' '}
            <Link to="/terms" className="hover:underline">Terms</Link> and{' '}
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
