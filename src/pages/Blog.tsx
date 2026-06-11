import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { BLOG_POSTS } from '@/constants';
import { Search, Clock, ArrowRight, Tag } from 'lucide-react';
import { CardSkeleton } from '@/components/features/Skeletons';

export default function Blog() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setLoading(false), 900);
  }, []);

  const filtered = BLOG_POSTS.filter(
    p => p.title.toLowerCase().includes(search.toLowerCase()) ||
         p.category.toLowerCase().includes(search.toLowerCase()) ||
         p.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 bg-primary/10 px-4 py-2 rounded-full">Solar Insights</span>
          <h1 className="text-5xl font-bold mb-6">The SolarPhase Blog</h1>
          <p className="text-xl text-muted-foreground mb-8">Expert insights on solar technology, financing, policy, and maximizing your clean energy investment.</p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search term.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {search === '' && (
                <div className="mb-12">
                  <Link to={`/blog/${filtered[0].slug}`} className="group block">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card border border-border rounded-2xl overflow-hidden card-hover">
                      <div className="h-64 lg:h-auto overflow-hidden">
                        <img
                          src={filtered[0].image}
                          alt={filtered[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-8 lg:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{filtered[0].category}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{filtered[0].readTime}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">{filtered[0].title}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">{filtered[0].excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{filtered[0].author}</p>
                            <p className="text-xs text-muted-foreground">{filtered[0].date}</p>
                          </div>
                          <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                            Read article <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Rest */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(search === '' ? filtered.slice(1) : filtered).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden card-hover">
                    <div className="h-48 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          <Tag className="w-3 h-3" />{post.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
