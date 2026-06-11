import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { FAQ_ITEMS } from '@/constants';
import { ChevronDown, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function FAQ() {
  const [search, setSearch] = useState('');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const filtered = FAQ_ITEMS.filter(
    item => item.question.toLowerCase().includes(search.toLowerCase()) ||
            item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">FAQ</span>
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground mb-8">Find answers about our platform, solar technology, financing, and support.</p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No results found</h3>
              <p className="text-muted-foreground mb-5">Try a different search term or contact our team directly.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                Contact Support <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item, i) => (
                <AccordionItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-16 bg-muted/50 border border-border rounded-2xl p-8 text-center">
              <h3 className="font-bold text-xl mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-5">Our support team typically responds within a few hours.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                Contact Support <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
