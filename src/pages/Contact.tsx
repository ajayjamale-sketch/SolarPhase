import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We will respond within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Contact Us</span>
          <h1 className="text-5xl font-bold mb-6">We Are Here to Help</h1>
          <p className="text-xl text-muted-foreground">Questions about solar, our platform, or pricing? Our team typically responds within a few hours.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info column */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: 'Email', value: 'hello@solarphase.com', sub: 'General inquiries' },
                    { icon: Phone, label: 'Phone', value: '+1 (415) 555-0192', sub: 'Mon–Fri, 8am–6pm PT' },
                    { icon: MapPin, label: 'Office', value: '548 Market St, Suite 230', sub: 'San Francisco, CA 94104' },
                    { icon: Clock, label: 'Support Hours', value: '24/7 for Pro & Enterprise', sub: '48h email for Residential' },
                  ].map(item => (
                    <div key={item.label} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                        <p className="text-sm text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-muted/50 border border-border rounded-2xl overflow-hidden h-52 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                  <p className="text-xs text-muted-foreground">548 Market St, Suite 230</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Jane Smith"
                        className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.name ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                      />
                      {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="jane@example.com"
                        className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.email ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                      />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => handleChange('subject', e.target.value)}
                      placeholder="Question about monitoring setup"
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.subject ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                    {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={6}
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      placeholder="Tell us about your solar project or question..."
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.message ? 'border-destructive' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none`}
                    />
                    {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
