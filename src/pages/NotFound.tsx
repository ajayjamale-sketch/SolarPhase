import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Zap, Home, ArrowLeft } from 'lucide-react';
import logoUrl from '@/assets/logo.jpg';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="text-center relative max-w-lg">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 animate-float bg-white p-1">
          <img src={logoUrl} alt="SolarPhase Logo" className="w-full h-full object-contain rounded-xl" />
        </div>

        <h1 className="text-8xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">
          The page you are looking for does not exist or may have been moved. Let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
          >
            <Home className="w-5 h-5" /> Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-border font-semibold rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {[
            { label: 'Home', href: '/' },
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Contact', href: '/contact' },
            { label: 'Blog', href: '/blog' },
          ].map(link => (
            <Link key={link.href} to={link.href} className="hover:text-primary transition-colors underline underline-offset-4">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
