import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { PRICING_PLANS } from '@/constants';
import { Check, ArrowRight, Zap } from 'lucide-react';

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Pricing</span>
          <h1 className="text-5xl font-bold mb-6">Transparent Pricing for Every Stage</h1>
          <p className="text-xl text-muted-foreground mb-10">
            Start free, scale as you grow. All plans include a 14-day free trial with no credit card required.
          </p>

          <div className="inline-flex items-center bg-card border border-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${!yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Yearly
              <span className="ml-2 text-xs font-bold text-accent">Save 17%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PRICING_PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted ? 'border-primary shadow-2xl shadow-primary/20' : 'border-border card-hover'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-sm font-bold px-5 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6 pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    {plan.highlighted && <Zap className="w-5 h-5 text-primary" />}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-black text-primary">
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground mb-2">/{yearly ? 'year' : 'month'}</span>
                  </div>
                  {yearly && (
                    <p className="text-sm text-accent font-medium">
                      Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice)} per year
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all text-base ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-0.5'
                      : 'border-2 border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ supplement */}
          <div className="mt-20 text-center bg-muted/50 rounded-2xl p-12">
            <h2 className="text-2xl font-bold mb-3">Questions about pricing?</h2>
            <p className="text-muted-foreground mb-6">Our team is ready to help you choose the right plan for your needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Talk to Sales
              </Link>
              <Link to="/faq" className="px-6 py-3 border border-border font-semibold rounded-xl hover:bg-muted transition-colors">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
