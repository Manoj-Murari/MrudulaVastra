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
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-text-muted hover:text-forest transition-colors font-dm text-sm group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform duration-200"
          />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-4 bg-gold/20" />

        {/* Breadcrumb Trail */}
        <ol className="flex items-center gap-2 font-dm text-sm tracking-wide">
          <li>
            <Link
              href="/"
              className="text-text-muted hover:text-forest transition-colors uppercase"
            >
              Home
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <ChevronRight size={13} className="text-gold/40" />
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
      </div>
    </nav>
  );
}
