"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const router = useRouter();
  // On mobile: show only the last linkable parent (e.g. "← Sarees")
  const parentItem = [...items].reverse().find(item => item.href);

  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-2">

      {/* Mobile: compact back-link */}
      <div className="flex lg:hidden items-center">
        {parentItem ? (
          <button
            onClick={() => {
              if (window.history.length > 2) {
                router.back();
              } else {
                router.push(parentItem.href!);
              }
            }}
            className="flex items-center gap-1 text-[12px] font-dm text-text-muted hover:text-forest transition-colors uppercase tracking-wider"
          >
            <ChevronLeft size={14} strokeWidth={2} />
            BACK
          </button>
        ) : null}
      </div>

      {/* Desktop: full trail */}
      <div className="hidden lg:flex items-center gap-5">
        <ol className="flex items-center gap-2 font-dm text-[11px] tracking-[0.15em] uppercase w-full">
          <li className="shrink-0">
            <Link href="/" className="text-text-muted hover:text-forest transition-colors">
              HOME
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className={`flex items-center gap-2 ${!item.href ? "min-w-0 flex-1" : "shrink-0"}`}>
              <span className="text-gold/40 shrink-0">/</span>
              {item.href ? (
                <Link href={item.href} className="text-text-muted hover:text-forest transition-colors whitespace-nowrap">
                  {item.label}
                </Link>
              ) : (
                <span className="text-forest font-bold truncate block w-full">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
