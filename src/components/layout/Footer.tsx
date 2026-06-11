import { Link } from 'react-router-dom';
import { Zap, Twitter, Linkedin, Github, Youtube, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Careers', href: '/about' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('You have been subscribed to SolarPhase updates.');
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.jpg" 
                alt="SolarPhase Logo" 
                className="w-10 h-10 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-xl">Solar<span className="text-primary">Phase</span></span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered solar energy management for homeowners, businesses, and installers. Monitor, optimize, and finance your solar journey from one platform.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'Joining...' : 'Subscribe'}
              </button>
            </form>

            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Linkedin, Github, Youtube, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SolarPhase, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
              SOC 2 Type II Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
