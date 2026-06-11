import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import {
  Sun, BarChart3, Zap, Leaf, Bell, DollarSign, Shield, Smartphone,
  Cloud, Settings, Activity, Database, HardHat, Wrench, Building2,
  Users, CreditCard, Globe, BarChart2, Cpu
} from 'lucide-react';

const FEATURE_CATEGORIES = [
  {
    category: 'AI Solar Assessment',
    description: 'Satellite-powered intelligence that evaluates solar potential before you spend a dollar.',
    color: 'text-primary bg-primary/10',
    borderColor: 'border-primary/20',
    features: [
      { icon: Sun, title: 'Roof Analysis Engine', desc: 'Analyzes roof pitch, orientation, and usable area from satellite imagery with 97% structural accuracy.' },
      { icon: Cloud, title: 'Weather Intelligence', desc: 'Integrates 15 years of local solar irradiance data with seasonal adjustment modeling.' },
      { icon: Activity, title: 'Shading Simulation', desc: 'Simulates how trees, chimneys, and structures affect generation throughout the year.' },
      { icon: Database, title: 'Utility Rate Integration', desc: 'Pulls real-time rate structures from 2,000+ utilities to calculate precise financial projections.' },
    ],
  },
  {
    category: 'Real-Time Monitoring',
    description: 'Complete visibility into every kilowatt-hour your system generates and consumes.',
    color: 'text-secondary bg-secondary/10',
    borderColor: 'border-secondary/20',
    features: [
      { icon: BarChart3, title: 'Live Production Charts', desc: 'Second-by-second generation and consumption data in interactive, mobile-ready charts.' },
      { icon: Bell, title: 'Intelligent Alerts', desc: 'AI anomaly detection flags performance degradation before it impacts your savings.' },
      { icon: Settings, title: 'Inverter Diagnostics', desc: 'Deep integration with 35+ inverter brands for component-level health metrics.' },
      { icon: Smartphone, title: 'Mobile Access', desc: 'Full dashboard on all devices with push notifications for critical alerts.' },
    ],
  },
  {
    category: 'Project Management',
    description: 'End-to-end tools for installers and EPCs to manage every phase of a solar project.',
    color: 'text-primary bg-primary/10',
    borderColor: 'border-primary/20',
    features: [
      { icon: HardHat, title: 'Project Pipeline', desc: 'Track every project from lead acquisition through commissioning in a unified workflow.' },
      { icon: Users, title: 'Lead Management', desc: 'Receive and accept qualified customer leads directly from the SolarPhase marketplace.' },
      { icon: Activity, title: 'Gantt Timeline', desc: 'Visual project scheduling with phase tracking and milestone management.' },
      { icon: Wrench, title: 'Maintenance Scheduler', desc: 'Schedule preventive and corrective maintenance tasks with technician assignment.' },
    ],
  },
  {
    category: 'Financing Marketplace',
    description: 'One platform to compare, qualify for, and secure the best solar financing available.',
    color: 'text-accent bg-accent/10',
    borderColor: 'border-accent/20',
    features: [
      { icon: DollarSign, title: 'Loan Marketplace', desc: 'Pre-qualified offers from 40+ lenders with a single soft credit inquiry.' },
      { icon: BarChart2, title: 'ROI Calculator', desc: 'Detailed financial modeling with payback period, IRR, and 25-year savings projections.' },
      { icon: Shield, title: 'Incentive Finder', desc: 'Automatically identifies all applicable federal, state, and utility incentives.' },
      { icon: CreditCard, title: 'EMI Calculator', desc: 'Instant monthly payment estimates across different loan amounts, rates, and tenures.' },
    ],
  },
  {
    category: 'Enterprise Energy Management',
    description: 'Multi-site oversight tools for energy managers running large solar portfolios.',
    color: 'text-secondary bg-secondary/10',
    borderColor: 'border-secondary/20',
    features: [
      { icon: Building2, title: 'Multi-Site Dashboard', desc: 'Monitor generation, consumption, and CO2 savings across unlimited sites from one view.' },
      { icon: Cpu, title: 'AI Optimization', desc: 'Machine learning recommendations that shift loads to maximize solar self-consumption.' },
      { icon: Globe, title: 'Grid Integration', desc: 'Real-time grid import/export tracking with virtual power plant participation.' },
      { icon: BarChart3, title: 'Benchmark Reporting', desc: 'Compare performance across sites and against industry benchmarks.' },
    ],
  },
  {
    category: 'Sustainability & Carbon',
    description: 'Quantify your environmental impact and meet ESG reporting requirements.',
    color: 'text-accent bg-accent/10',
    borderColor: 'border-accent/20',
    features: [
      { icon: Leaf, title: 'Carbon Score', desc: 'Real-time CO2 offset calculations based on your regional grid emissions factor.' },
      { icon: Activity, title: 'ESG Reports', desc: 'Monthly and annual sustainability reports suitable for corporate ESG disclosures.' },
      { icon: Cloud, title: 'Grid Contribution', desc: 'Track clean energy exported to the grid and its community impact.' },
      { icon: Zap, title: 'Certification Support', desc: 'Documentation for LEED credits, green certifications, and renewable energy certificates.' },
    ],
  },
];

export default function Features() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Platform Features</span>
          <h1 className="text-5xl font-bold mb-6">Every Tool You Need for Solar Success</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            SolarPhase integrates 12 core feature modules — from AI assessment and real-time monitoring to project management, financing, and sustainability tracking — into a single platform for all 7 user roles.
          </p>
        </div>
      </section>

      {/* Feature modules count */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['AI Assessment', 'Real-Time Monitoring', 'Project Mgmt', 'Financing', 'Enterprise', 'Sustainability'].map((m, i) => (
              <div key={m} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-primary">{String(i + 1).padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {FEATURE_CATEGORIES.map((cat, idx) => (
        <section key={cat.category} className={`py-20 ${idx % 2 === 1 ? 'bg-muted/30' : 'bg-background'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className={`inline-block text-sm font-bold px-4 py-2 rounded-full mb-4 ${cat.color}`}>{cat.category}</span>
              <h2 className="text-3xl font-bold mb-3">{cat.category}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">{cat.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cat.features.map(feature => (
                <div key={feature.title} className={`bg-card border-2 ${cat.borderColor} rounded-2xl p-6 card-hover`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${cat.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Footer />
      <ScrollToTop />
    </div>
  );
}
