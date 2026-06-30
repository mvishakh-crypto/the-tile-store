import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  hash?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (hash: string) => void;
}

export default function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-charcoal/40 select-none py-2 mb-6">
      <button
        onClick={() => onNavigate('#/')}
        className="flex items-center gap-1 hover:text-gold-600 transition-colors cursor-pointer"
        aria-label="Home"
      >
        <Home className="w-3 h-3" />
        HOME
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-2.5 h-2.5 text-charcoal/20 shrink-0" />
            {isLast || !item.hash ? (
              <span className="font-semibold text-charcoal/80 truncate max-w-[150px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.hash!)}
                className="hover:text-gold-600 transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-none"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
