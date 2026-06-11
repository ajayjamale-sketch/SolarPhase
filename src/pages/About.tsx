import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { Sun, Target, Users, Zap, Award, Globe, Leaf } from 'lucide-react';

const TEAM = [
  { name: 'Elena Morrison', role: 'CEO & Co-Founder', bio: 'Former Tesla Energy VP with 15 years in clean energy technology.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { name: 'James Okafor', role: 'CTO & Co-Founder', bio: 'Machine learning expert, previously led AI teams at Google DeepMind.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { name: 'Priya Nair', role: 'VP of Product', bio: 'Product visionary with a background in energy management software.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  { name: 'Carlos Reyes', role: 'Head of Partnerships', bio: 'Built installer networks across 25 states, driving 40% of company revenue.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { name: 'Sophie Laurent', role: 'Lead AI Engineer', bio: 'Developed core satellite image analysis models with 96.4% accuracy.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
  { name: 'Marcus Wei', role: 'VP of Finance', bio: 'Structured over $2B in clean energy financing at Goldman Sachs.', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80' },
];

const TIMELINE = [
  { year: '2019', event: 'SolarPhase founded in San Francisco with $3.2M seed funding.' },
  { year: '2020', event: 'Launched AI assessment engine; processed 10,000 properties in first month.' },
  { year: '2021', event: 'Series A: $18M raised. Launched real-time monitoring product.' },
  { year: '2022', event: 'Financing Marketplace launched with 12 lending partners.' },
  { year: '2023', event: 'Crossed 5,000 active installations. Series B: $45M raised.' },
  { year: '2024', event: 'Enterprise product launched; signed partnerships with 3 major utilities.' },
  { year: '2025', event: '12,400+ active users. Monitoring over 1.8M kWh daily. Expanding globally.' },
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Our Story</span>
          <h1 className="text-5xl font-bold mb-6">Accelerating the World's Transition to Solar Energy</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            SolarPhase was founded on a simple premise: the biggest barrier to solar adoption isn't cost or technology — it's complexity. We built an AI platform to remove that complexity entirely.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">Our Mission</span>
              <h2 className="text-4xl font-bold mb-6">Make Clean Energy Accessible to Everyone</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We believe solar energy should be as simple to adopt as any consumer product. Through AI, automation, and transparent data, SolarPhase removes every friction point from the solar journey.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the initial question "Is solar right for my home?" to years of optimized performance, we provide every tool a homeowner, business, or installer needs to make solar work.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Sun, title: 'Transparency', desc: 'No hidden fees, no opaque algorithms. Every metric explained clearly.' },
                { icon: Target, title: 'Precision', desc: 'AI accuracy within 5% of actual production. Data you can rely on.' },
                { icon: Leaf, title: 'Sustainability', desc: 'Every decision optimized for both financial and environmental outcomes.' },
                { icon: Users, title: 'Community', desc: 'Building a network of solar advocates who share knowledge and success.' },
              ].map((v, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '12,400+', label: 'Active Users', color: 'text-primary' },
              { icon: Zap, value: '1.8M kWh', label: 'Monitored Daily', color: 'text-secondary' },
              { icon: Globe, value: '41 States', label: 'Coverage Area', color: 'text-accent' },
              { icon: Award, value: '$45M', label: 'Series B Raised', color: 'text-primary' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-card border border-border rounded-2xl p-8">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The Team Behind SolarPhase</h2>
            <p className="text-xl text-muted-foreground">Energy experts, AI researchers, and product leaders united by a clean energy mission.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <div key={member.name} className="bg-card border border-border rounded-2xl p-6 flex gap-5 items-start card-hover">
                <img src={member.img} alt={member.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground">From a San Francisco garage to the nation's leading solar intelligence platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <span className="w-16 flex-shrink-0 text-right text-sm font-bold text-primary">{item.year}</span>
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0 mt-1 relative z-10 ring-4 ring-background" />
                    <p className="text-muted-foreground leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
