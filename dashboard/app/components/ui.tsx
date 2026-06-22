"use client";
import React from "react";

export function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        accent ? "border-blue/40 ring-1 ring-blue/20" : "border-slate-200"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold tabular-nums text-navy">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </div>
  );
}

export function Panel({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-navy">{title}</h3>
        {right}
      </header>
      <div className="p-2 sm:p-4">{children}</div>
    </section>
  );
}

export function Bars({ data, total }: { data: { key: string; count: number }[]; total: number }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) return <Empty />;
  return (
    <ul className="space-y-2 p-2">
      {data.map((d) => (
        <li key={d.key} className="flex items-center gap-3 text-sm">
          <span className="w-40 shrink-0 truncate text-navy" title={d.key}>
            {d.key}
          </span>
          <span className="relative h-5 flex-1 overflow-hidden rounded bg-slate-100">
            <span
              className="absolute inset-y-0 left-0 rounded bg-blue/80"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </span>
          <span className="w-16 shrink-0 text-right font-semibold tabular-nums text-navy">
            {d.count}
            <span className="ml-1 text-xs font-normal text-slate-400">
              {total ? `${Math.round((d.count / total) * 100)}%` : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Empty({ children = "No records yet." }: { children?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
      {children}
    </div>
  );
}

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "green" | "amber" | "blue";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber/15 text-amber",
    blue: "bg-blue/10 text-blue-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-navy transition hover:bg-tint"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
      </svg>
      Export CSV
    </button>
  );
}

/** Sortable column header. */
export function SortTh({
  label,
  col,
  sort,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  col: string;
  sort: { col: string; dir: "asc" | "desc" };
  onSort: (col: string) => void;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const active = sort.col === col;
  return (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 text-${align} text-xs font-bold uppercase tracking-wide text-navy hover:bg-blue/10 ${className}`}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${active ? "text-blue" : "text-slate-300"}`}>
          {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </span>
    </th>
  );
}

export const inputCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20";
