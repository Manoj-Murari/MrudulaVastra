"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const router = useRouter();

  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-2"
    >
      <div className="flex items-center gap-5">


        {/* Breadcrumb Trail */}
        <ol className="flex items-center gap-2 font-dm text-[11px] tracking-[0.15em] uppercase w-full">
          <li>
            <Link
              href="/"
              className="text-text-muted hover:text-forest transition-colors"
            >
              HOME
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-gold/40">/</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-text-muted hover:text-forest transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-forest font-bold">
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
