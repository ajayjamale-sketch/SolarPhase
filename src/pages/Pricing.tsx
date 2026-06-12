import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { PRICING_PLANS } from '@/constants';
import { Check, ArrowRight, Zap, Lock, CreditCard, ShieldCheck, RefreshCw, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/lib/auth';
import { PricingPlan } from '@/types';
import { toast } from 'sonner';

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { user, updateUser, isAuthenticated } = useAuth();
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  const handlePlanClick = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
    setPaymentForm({
      name: user?.name || '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      zip: ''
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setCheckoutSuccess(true);
      if (selectedPlan) {
        try {
          // Update profile in LocalStorage (solarphase_users)
          const updated = updateUserProfile({ plan: selectedPlan.name });
          // Update profile in React Context state
          updateUser(updated);
          toast.success(`Plan upgraded! You are now subscribed to the ${selectedPlan.name} Plan.`);
        } catch (err: any) {
          toast.error(err.message || 'Failed to update plan.');
        }
      }
    }, 1500);
  };

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
            {PRICING_PLANS.map(plan => {
              const isCurrentPlan = user?.plan === plan.name;
              return (
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

                  {isAuthenticated ? (
                    <button
                      onClick={() => handlePlanClick(plan)}
                      disabled={isCurrentPlan}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all text-base ${
                        isCurrentPlan
                          ? 'bg-accent/15 text-accent border border-accent/20 cursor-not-allowed'
                          : plan.highlighted
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-0.5'
                            : 'border-2 border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Subscription' : plan.cta} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
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
                  )}
                </div>
              );
            })}
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

      {/* Checkout Modal */}
      {checkoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative transition-all duration-300">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => { setCheckoutOpen(false); setCheckoutSuccess(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {!checkoutSuccess ? (
              <form onSubmit={handlePaymentSubmit} className="flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Order Summary (Left/Top side) */}
                <div className="flex-1 bg-muted/40 p-6 border-b md:border-b-0 md:border-r border-border text-left">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Order Summary</span>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-base">{selectedPlan.name} Plan</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{selectedPlan.description}</p>
                  </div>

                  <div className="mt-8 space-y-3 text-xs border-t border-border/60 pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price ({yearly ? 'Yearly' : 'Monthly'})</span>
                      <span className="font-semibold text-foreground">${yearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Tax (8%)</span>
                      <span className="font-semibold text-foreground">${(yearly ? selectedPlan.yearlyPrice * 0.08 : selectedPlan.monthlyPrice * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 text-sm font-bold">
                      <span>Total Due</span>
                      <span className="text-amber-600 dark:text-primary font-black">${(yearly ? selectedPlan.yearlyPrice * 1.08 : selectedPlan.monthlyPrice * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-8 bg-amber-500/10 dark:bg-primary/10 rounded-xl p-3 border border-amber-500/20 dark:border-primary/20 flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-[10px] text-amber-800 dark:text-primary leading-relaxed">
                      <strong>14-Day Free Trial</strong>: You won't be charged until your trial ends. Cancel anytime.
                    </div>
                  </div>
                </div>

                {/* Payment Details (Right/Bottom side) */}
                <div className="flex-1 p-6 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> Payment Method</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Transactions are encrypted and secure.</p>

                    {/* Card Inputs */}
                    <div className="mt-6 space-y-3 text-xs">
                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={paymentForm.name}
                          onChange={e => setPaymentForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            value={paymentForm.cardNumber}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setPaymentForm(p => ({ ...p, cardNumber: val }));
                            }}
                            className="w-full pl-3 pr-10 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            required
                            placeholder="12/28"
                            maxLength={5}
                            value={paymentForm.expiry}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              }
                              setPaymentForm(p => ({ ...p, expiry: val }));
                            }}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">CVC</label>
                          <input
                            type="text"
                            required
                            placeholder="123"
                            maxLength={4}
                            value={paymentForm.cvc}
                            onChange={e => setPaymentForm(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">Billing ZIP Code</label>
                        <input
                          type="text"
                          required
                          placeholder="90210"
                          maxLength={5}
                          value={paymentForm.zip}
                          onChange={e => setPaymentForm(p => ({ ...p, zip: e.target.value.replace(/\D/g, '') }))}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 text-sm animate-pulse-slow"
                  >
                    {paymentLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        Start 14-Day Free Trial
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Screen */
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 animate-bounce">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-bold text-2xl mb-2 flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Subscription Activated!
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
                  Congratulations! Your SolarPhase account has been upgraded to the <strong className="text-foreground">{selectedPlan.name}</strong> plan.
                </p>

                <Link
                  to="/dashboard"
                  onClick={() => { setCheckoutOpen(false); setCheckoutSuccess(false); }}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md text-sm text-center"
                >
                  Go to My Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
      <ScrollToTop />
    </div>
  );
}
