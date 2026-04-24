"use client";

import Link from "next/link";

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
      <div className="flex items-center gap-5">


        {/* Breadcrumb Trail */}
        <ol className="flex items-center gap-2 font-dm text-[11px] tracking-[0.15em] uppercase w-full">
          <li className="shrink-0">
            <Link
              href="/"
              className="text-text-muted hover:text-forest transition-colors"
            >
              HOME
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className={`flex items-center gap-2 ${!item.href ? "min-w-0 flex-1" : "shrink-0"}`}>
              <span className="text-gold/40 shrink-0">/</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-text-muted hover:text-forest transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-forest font-bold truncate block w-full">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
