import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-2"
    >
      <ol className="flex items-center gap-1.5 font-dm text-[11px] tracking-wider">
        <li>
          <Link
            href="/"
            className="text-text-muted hover:text-forest transition-colors uppercase"
          >
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-gold/40" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-text-muted hover:text-forest transition-colors uppercase"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-forest font-medium uppercase">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
