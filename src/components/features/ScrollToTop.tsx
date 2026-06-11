import { ChevronUp } from 'lucide-react';
import { useScrollTop } from '@/hooks/useScrollTop';

export default function ScrollToTop() {
  const { visible, scrollToTop } = useScrollTop();

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
