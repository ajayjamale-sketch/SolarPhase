interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-border">/</span>}
          <span className={index === items.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground transition-colors'}>
            {item.label}
          </span>
        </span>
      ))}
    </nav>
  );
}
