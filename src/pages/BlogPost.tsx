import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/features/ScrollToTop';
import { BLOG_POSTS } from '@/constants';
import { ArrowLeft, Clock, Tag, ArrowRight } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const related = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!post) navigate('/blog');
  }, [post, navigate]);

  if (!post) return null;

  const contentHtml = post.content
    .split('\n\n')
    .map((block, i) => {
      if (block.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{block.slice(3)}</h2>;
      }
      return <p key={i} className="text-muted-foreground leading-relaxed mb-4">{block}</p>;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-1 text-sm font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <Tag className="w-3 h-3" />{post.category}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />{post.readTime}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">{post.title}</h1>

        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">{post.author.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-sm">{post.author}</p>
            <p className="text-xs text-muted-foreground">{post.date}</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-10">
          <img src={post.image} alt={post.title} className="w-full h-64 sm:h-80 object-cover" />
        </div>

        <div className="prose-like">
          <p className="text-xl text-muted-foreground leading-relaxed mb-6 font-medium">{post.excerpt}</p>
          {contentHtml}
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-8">Continue Reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group flex gap-4 bg-card border border-border rounded-2xl p-5 card-hover">
                  <img src={p.image} alt={p.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-primary font-medium mb-1">{p.category}</p>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2">{p.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Start monitoring your solar system today</h3>
          <p className="text-muted-foreground mb-5 text-sm">Join 12,400+ users who track their solar performance with SolarPhase.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
