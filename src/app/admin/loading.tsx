"use client";

import { motion } from "framer-motion";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* ── Header Skeleton ── */}
      <div>
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
      </div>

      {/* ── KPI Matrix Skeleton ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-5 flex flex-col justify-between"
            style={{
              background: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              minHeight: 140,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
              <div className="w-16 h-5 rounded-full bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            <div className="mt-4">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
              <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row Skeleton ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
          <div className="h-[280px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-lg"></div>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/50 rounded mb-4"></div>
          <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-full w-[200px] mx-auto"></div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row Skeleton ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded mb-5"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}
        >
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-5"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-5 w-16 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
