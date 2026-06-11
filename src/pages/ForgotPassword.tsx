import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('Password reset email sent.');
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <img src="/logo.jpg" alt="SolarPhase Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
          <span className="font-bold text-xl">Solar<span className="text-primary">Phase</span></span>
        </Link>

        {sent ? (
          <div className="text-center bg-card border border-border rounded-2xl p-10">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Check your inbox</h1>
            <p className="text-muted-foreground mb-6">
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Did not receive the email? Check your spam folder or try again.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Try a different email
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-primary font-semibold hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>

            <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
            <p className="text-muted-foreground mb-8">
              Enter your account email and we will send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-muted border ${error ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <><Mail className="w-5 h-5" /> Send Reset Link</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
