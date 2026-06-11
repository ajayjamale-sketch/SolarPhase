import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly when you create an account, including your name, email address, and account type. When you connect a solar system for monitoring, we collect energy production data, consumption data, and system performance metrics transmitted by your inverter or monitoring device.\n\nWe also collect usage data about how you interact with our platform, including pages visited, features used, and actions taken. This information is collected through cookies and similar tracking technologies.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to provide, maintain, and improve our services. This includes processing your solar monitoring data to display real-time and historical performance metrics, calculating financial savings and environmental impact figures, generating performance reports, and identifying system anomalies that may require attention.\n\nWe may also use your information to communicate with you about your account, provide customer support, send product updates and security notices, and improve our AI models (using anonymized, aggregated data only).`,
  },
  {
    title: '3. Data Sharing and Disclosure',
    content: `We do not sell your personal information to third parties. We may share your information with service providers who assist us in delivering our platform, including cloud infrastructure providers, analytics services, and customer support tools. All service providers are contractually required to protect your information and use it only for authorized purposes.\n\nWe may disclose information if required by law, legal process, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of SolarPhase, our users, or the public.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your information. All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. We maintain SOC 2 Type II certification, which requires regular independent audits of our security controls.\n\nAccess to user data within our organization is restricted to personnel who need it to perform their job functions, and all employees with data access are subject to confidentiality obligations.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your account information for as long as your account is active. Energy monitoring data and performance history are retained for the duration of your subscription plus 12 months after cancellation. You may request deletion of your data at any time through your account settings or by contacting our support team.\n\nCertain information may be retained for longer periods where required by law or for legitimate business purposes such as fraud prevention and legal compliance.`,
  },
  {
    title: '6. Your Rights and Choices',
    content: `You have the right to access, correct, or delete your personal information at any time. You may also request a portable copy of your data in a machine-readable format. To exercise these rights, contact us at privacy@solarphase.com or use the data management tools in your account settings.\n\nYou may opt out of marketing communications at any time by clicking the unsubscribe link in any email or updating your notification preferences in your account settings. Note that opting out of marketing does not affect transactional communications related to your account.`,
  },
  {
    title: '7. Cookies and Tracking',
    content: `We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how our platform is used. You can control cookie settings through your browser preferences. Disabling certain cookies may affect platform functionality.\n\nWe use analytics services to understand aggregate usage patterns. These services may collect information about your use of our platform across sessions and devices.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or through a prominent notice on our platform at least 30 days before the changes take effect. Your continued use of SolarPhase after changes take effect constitutes your acceptance of the revised policy.`,
  },
];

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Legal</span>
            <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2025 · Effective: February 1, 2025</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              SolarPhase, Inc. ("SolarPhase," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and solar energy management platform. Please read this policy carefully. If you disagree with its terms, please discontinue use of our services.
            </p>
          </div>

          <div className="space-y-8">
            {SECTIONS.map(section => (
              <div key={section.title}>
                <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                {section.content.split('\n\n').map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-3">{p}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact our Privacy team at{' '}
              <a href="mailto:privacy@solarphase.com" className="text-primary hover:underline">privacy@solarphase.com</a> or by mail at:
            </p>
            <address className="mt-4 not-italic text-muted-foreground bg-muted/50 rounded-xl p-5">
              SolarPhase, Inc.<br />
              Attn: Privacy Team<br />
              548 Market St, Suite 230<br />
              San Francisco, CA 94104<br />
              United States
            </address>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
