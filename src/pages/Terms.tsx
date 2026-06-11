import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing or using SolarPhase, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services. These Terms apply to all visitors, users, and others who access or use SolarPhase.',
  },
  {
    title: '2. Description of Service',
    content: 'SolarPhase provides an AI-powered solar energy management platform that includes solar potential assessments, real-time energy monitoring, financing marketplace access, and carbon tracking tools. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice.',
  },
  {
    title: '3. User Accounts',
    content: 'To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized access. SolarPhase cannot and will not be liable for any loss or damage arising from your failure to protect your account credentials.',
  },
  {
    title: '4. Subscription Plans and Billing',
    content: 'SolarPhase offers subscription plans as described on our Pricing page. Subscriptions renew automatically unless cancelled before the renewal date. For monthly plans, cancellation takes effect at the end of the current billing period. For annual plans, we offer a prorated refund within the first 30 days. All prices are in US dollars and exclude applicable taxes.',
  },
  {
    title: '5. Acceptable Use',
    content: 'You agree not to use SolarPhase for any unlawful purpose, to transmit malicious code, to attempt to gain unauthorized access to any system, to collect user data without consent, to interfere with or disrupt the integrity of the service, or to impersonate any person or entity. Violation of these restrictions may result in immediate account termination.',
  },
  {
    title: '6. Data and Privacy',
    content: 'Your use of SolarPhase is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using SolarPhase, you consent to the collection and use of information as described in our Privacy Policy. You retain ownership of all data you submit to the platform.',
  },
  {
    title: '7. Intellectual Property',
    content: 'The SolarPhase platform, including all software, algorithms, designs, text, graphics, and other content, is owned by SolarPhase, Inc. and is protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the platform for its intended purpose. You may not copy, modify, or create derivative works based on our intellectual property.',
  },
  {
    title: '8. Disclaimers and Limitation of Liability',
    content: 'SolarPhase is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free or uninterrupted. Solar generation estimates and financial projections are based on historical data and models and are not guarantees of future performance. To the maximum extent permitted by law, SolarPhase shall not be liable for indirect, incidental, special, or consequential damages.',
  },
  {
    title: '9. Third-Party Services',
    content: 'SolarPhase integrates with third-party services including inverter manufacturers, utilities, and financing partners. We are not responsible for the availability, accuracy, or policies of these third-party services. Your use of third-party services accessed through SolarPhase is subject to their respective terms and conditions.',
  },
  {
    title: '10. Governing Law and Dispute Resolution',
    content: 'These Terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes arising from these Terms or your use of SolarPhase shall be resolved through binding arbitration in San Francisco, California, except that either party may seek injunctive relief in court for violations of intellectual property rights.',
  },
  {
    title: '11. Changes to Terms',
    content: 'We reserve the right to modify these Terms at any time. When we make material changes, we will provide at least 30 days notice via email or a prominent notice on the platform. Your continued use of SolarPhase after changes take effect constitutes acceptance of the revised Terms.',
  },
];

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Legal</span>
            <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2025 · Effective: February 1, 2025</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of SolarPhase, Inc.'s website, platform, and services. Please read these Terms carefully before using our services. These Terms constitute a legally binding agreement between you and SolarPhase, Inc.
            </p>
          </div>

          <div className="space-y-8">
            {SECTIONS.map(section => (
              <div key={section.title}>
                <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-bold mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these Terms? Contact us at{' '}
              <a href="mailto:legal@solarphase.com" className="text-primary hover:underline">legal@solarphase.com</a> or at our address: 548 Market St, Suite 230, San Francisco, CA 94104.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
