import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Sun, BarChart3, Leaf, ChevronDown, Star, Check, ChevronRight, Play } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { PRICING_PLANS, FAQ_ITEMS, TESTIMONIALS } from '@/constants';
import heroImage from '@/assets/hero-solar.jpg';

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end]);

  return <div ref={ref}>{prefix}{count.toLocaleString()}{suffix}</div>;
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Index() {
  const [pricingYearly, setPricingYearly] = useState(false);
  const [testimonialsIdx, setTestimonialsIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Section 1 – Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-secondary/20 blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Solar Intelligence</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Intelligent Solar<br />
              <span className="text-gradient">Energy Management</span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
              AI-powered assessments, real-time monitoring, financing, and carbon savings – all in one platform designed for the modern energy era.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/40 hover:shadow-2xl hover:-translate-y-0.5 text-base"
              >
                Start Saving <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-base"
              >
                <Play className="w-5 h-5" /> See Dashboard
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { label: 'Active Users', value: '12,400+' },
                { label: 'kWh Monitored Daily', value: '1.8M+' },
                { label: 'CO₂ Saved (tons)', value: '45,000+' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* Section 2 – Features */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Go Solar</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From AI site assessment to real-time performance monitoring, SolarPhase covers every step of your solar journey.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sun,
                title: 'AI Solar Assessment',
                desc: 'Get an accurate solar potential analysis using satellite imagery, weather data, and AI — in under 60 seconds.',
                color: 'text-primary bg-primary/10',
              },
              {
                icon: BarChart3,
                title: 'Smart Monitoring',
                desc: 'Real-time energy production, consumption, and export data with intelligent alerts and performance optimization.',
                color: 'text-secondary bg-secondary/10',
              },
              {
                icon: Zap,
                title: 'Financing Marketplace',
                desc: 'Compare pre-qualified loans and lease offers from 40+ lenders with a single soft credit check.',
                color: 'text-primary bg-primary/10',
              },
              {
                icon: Leaf,
                title: 'Carbon Tracking',
                desc: 'Visualize your environmental impact with real-time CO₂ savings, green energy scores, and sustainability reports.',
                color: 'text-accent bg-accent/10',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 card-hover group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 – Product Workflow */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How SolarPhase Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">A streamlined process from initial assessment to ongoing optimization – designed to make solar simple.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" style={{ left: '12.5%', right: '12.5%' }} />

            {[
              { step: '01', title: 'Assess Your Roof', desc: 'Our AI analyzes satellite imagery and local weather to calculate your exact solar potential.', icon: Sun },
              { step: '02', title: 'Compare Quotes', desc: 'Receive competitive proposals from vetted local installers and financing offers from 40+ lenders.', icon: BarChart3 },
              { step: '03', title: 'Install & Monitor', desc: 'Once installed, connect your system for real-time monitoring from day one.', icon: Zap },
              { step: '04', title: 'Optimize & Save', desc: 'AI continuously optimizes energy use, tracks savings, and alerts you to performance issues.', icon: Leaf },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-2xl gradient-solar flex items-center justify-center shadow-xl mb-5 z-10">
                  <step.icon className="w-7 h-7 text-slate-900" />
                </div>
                <span className="text-xs font-bold text-primary mb-2">{step.step}</span>
                <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 – Benefits with Counters */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Measurable Results, Guaranteed</h2>
            <p className="text-xl text-muted-foreground">Our platform customers see real, quantifiable benefits from their solar investments.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { end: 70, suffix: '%', label: 'Average Electricity Bill Reduction', sublabel: 'Compared to pre-solar baseline' },
              { end: 247, suffix: '', prefix: '$', label: 'Average Monthly Savings', sublabel: 'Across all residential users' },
              { end: 24, suffix: '/7', label: 'Monitoring Coverage', sublabel: 'Continuous system health tracking' },
              { end: 8, suffix: ' yrs', label: 'Average Payback Period', sublabel: 'Down from 12 years in 2019' },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-8 text-center card-hover">
                <div className="text-4xl font-black text-primary mb-2">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <p className="font-semibold mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 – Dashboard Preview */}
      <section className="py-24 bg-card border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-4 block">Live Dashboard</span>
              <h2 className="text-4xl font-bold mb-6">Your Energy Data, Always at a Glance</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                The SolarPhase dashboard gives you a complete picture of your solar system's performance. Track generation, consumption, savings, and environmental impact in real time.
              </p>
              <ul className="space-y-4 mb-8">
                {['Real-time kWh generation and consumption charts', 'Instant CO₂ offset and savings tracking', 'Predictive maintenance alerts', 'Inverter health monitoring'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:shadow-xl">
                View Live Demo <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-muted rounded-2xl border border-border p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Energy Overview</h3>
                  <span className="text-xs text-primary bg-primary/20 px-3 py-1 rounded-full">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Generated Today', value: '47.3 kWh', color: 'text-primary' },
                    { label: 'CO₂ Saved', value: '21.4 kg', color: 'text-accent' },
                    { label: 'Money Saved', value: '$9.84', color: 'text-secondary' },
                  ].map(metric => (
                    <div key={metric.label} className="bg-card rounded-xl p-4 border border-border">
                      <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
                {/* Mini chart mockup */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                        <div className="rounded-sm bg-primary/80" style={{ height: `${h}%` }} />
                        <span className="text-xs text-muted-foreground text-center">{['M','T','W','T','F','S','S'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 bg-accent text-white rounded-xl px-5 py-3 shadow-xl">
                <p className="text-xs font-medium opacity-80">System Health</p>
                <p className="text-xl font-black">98.4%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 – Testimonials */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Solar Adopters Nationwide</h2>
            <p className="text-xl text-muted-foreground">Real results from homeowners, businesses, and installers using SolarPhase.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-2xl p-8 card-hover">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 gap-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialsIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === testimonialsIdx ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 – Pricing */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">Choose the plan that fits your solar journey.</p>
            <div className="inline-flex items-center bg-card border border-border rounded-xl p-1 gap-1">
              <button
                onClick={() => setPricingYearly(false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${!pricingYearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingYearly(true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${pricingYearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Yearly <span className="text-xs ml-1 text-accent font-semibold">-17%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted
                    ? 'border-primary shadow-2xl shadow-primary/20 scale-105'
                    : 'border-border card-hover'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-primary">
                    ${pricingYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/{pricingYearly ? 'yr' : 'mo'}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/30 hover:shadow-xl'
                      : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 – FAQ */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Common Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about SolarPhase.</p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.slice(0, 5).map((item, i) => (
              <AccordionItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              View all questions <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 9 – CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Switch to Solar?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join over 12,000 households and businesses already saving with SolarPhase. Get your free AI assessment today.
          </p>
          <form
            onSubmit={e => { e.preventDefault(); window.location.href = '/register'; }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/40 hover:shadow-2xl whitespace-nowrap text-base"
            >
              Get Free Assessment
            </button>
          </form>
          <p className="mt-4 text-slate-400 text-sm">No credit card required. Free for 14 days.</p>
        </div>
      </section>

      {/* Section 10 – Footer */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Installer Vendor Comparison</h2>
            <p className="text-xl text-muted-foreground">Compare top-rated solar installers available through SolarPhase Marketplace.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {['Installer', 'Avg. Price (5kW)', 'Rating', 'Warranty', 'Response Time', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-sm font-semibold text-muted-foreground border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'SunBuilders LLC', price: '$14,200', rating: '4.9', warranty: '25 years', response: '< 2 hours', popular: true },
                  { name: 'BrightGrid Solar', price: '$15,800', rating: '4.7', warranty: '20 years', response: '< 4 hours', popular: false },
                  { name: 'EcoSun Contractors', price: '$13,400', rating: '4.5', warranty: '15 years', response: '< 24 hours', popular: false },
                ].map(installer => (
                  <tr key={installer.name} className={`hover:bg-muted/30 transition-colors ${installer.popular ? 'bg-primary/5' : 'bg-card'}`}>
                    <td className="px-5 py-4 font-semibold">
                      {installer.name}
                      {installer.popular && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Top Rated</span>}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">{installer.price}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(installer.rating)) ? 'fill-primary text-primary' : 'text-border'}`} />)}
                        <span className="text-sm font-medium ml-1">{installer.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{installer.warranty}</td>
                    <td className="px-5 py-4 text-muted-foreground">{installer.response}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => { window.location.href = '/register'; }} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">Select</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
