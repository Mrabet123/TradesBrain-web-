"use client";
import { useMemo, useState } from "react";
import type { FoundingRep } from "@/lib/types";
import { countBy, countLastDays, parseYears } from "@/lib/analyze";
import { downloadCsv, fmtDate } from "@/lib/csv";
import { US_STATES } from "@/lib/states";
import { Badge, Bars, Card, Empty, ExportButton, Panel, SortTh, inputCls } from "./ui";

type SortCol = "full_name" | "trade" | "state_region" | "years" | "created_at";

// Match a free-text region against a canonical US state name.
function canonicalState(region: string | null | undefined): string | null {
  if (!region) return null;
  const r = region.trim().toLowerCase();
  if (!r) return null;
  const exact = US_STATES.find((s) => s.toLowerCase() === r);
  if (exact) return exact;
  const contained = US_STATES.find((s) => r.includes(s.toLowerCase()));
  return contained ?? null;
}

export default function FoundingRepsTab({ rows }: { rows: FoundingRep[] }) {
  const [fTrade, setFTrade] = useState("");
  const [fState, setFState] = useState("");
  const [fMinYears, setFMinYears] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<{ col: SortCol; dir: "asc" | "desc" }>({
    col: "years",
    dir: "desc",
  });

  const total = rows.length;
  const byTrade = useMemo(() => countBy(rows, (r) => r.trade), [rows]);
  const byState = useMemo(() => countBy(rows, (r) => r.state_region), [rows]);
  const last7 = useMemo(() => countLastDays(rows, (r) => r.created_at, 7), [rows]);

  // Coverage: applications mapped to canonical states.
  const coverage = useMemo(() => {
    const counts = new Map<string, number>();
    let unrecognised = 0;
    for (const r of rows) {
      const s = canonicalState(r.state_region);
      if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
      else unrecognised++;
    }
    const covered = [...counts.keys()].length;
    return { counts, unrecognised, covered };
  }, [rows]);

  const tradeOptions = useMemo(() => byTrade.map((d) => d.key).filter((k) => k !== "—"), [byTrade]);
  const stateOptions = useMemo(
    () => byState.map((d) => d.key).filter((k) => k !== "—").sort(),
    [byState]
  );

  const filtered = useMemo(() => {
    const min = fMinYears ? Number(fMinYears) : null;
    return rows.filter((r) => {
      if (fTrade && r.trade !== fTrade) return false;
      if (fState && r.state_region !== fState) return false;
      if (min != null) {
        const y = parseYears(r.years_in_trade);
        if (y == null || y < min) return false;
      }
      return true;
    });
  }, [rows, fTrade, fState, fMinYears]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sort.col === "years") {
        av = parseYears(a.years_in_trade) ?? -1;
        bv = parseYears(b.years_in_trade) ?? -1;
      } else if (sort.col === "created_at") {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      } else {
        av = String(a[sort.col] ?? "").toLowerCase();
        bv = String(b[sort.col] ?? "").toLowerCase();
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  function onSort(col: string) {
    setSort((s) =>
      s.col === col ? { col: s.col, dir: s.dir === "asc" ? "desc" : "asc" } : { col: col as SortCol, dir: col === "years" || col === "created_at" ? "desc" : "asc" }
    );
  }

  function exportCsv() {
    downloadCsv(
      "founding_rep_applications.csv",
      ["Name", "Trade", "State / region", "Years in trade", "Licence number", "VAT number", "Email", "Phone", "Why", "Applied"],
      sorted.map((r) => [
        r.full_name, r.trade ?? "", r.state_region ?? "", r.years_in_trade ?? "",
        r.licence_number ?? "", r.vat_number ?? "", r.email, r.phone ?? "",
        r.why_text ?? "", r.created_at,
      ])
    );
  }

  const hasFilters = fTrade || fState || fMinYears;

  return (
    <div className="space-y-6">
      {/* summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total applications" value={total} accent />
        <Card label="States covered" value={coverage.covered} sub={`of ${US_STATES.length} (+DC)`} />
        <Card label="Distinct trades" value={tradeOptions.length} sub="across applicants" />
        <Card label="Last 7 days" value={last7} sub="application velocity" />
      </div>

      {/* breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="By trade">
          <Bars data={byTrade} total={total} />
        </Panel>
        <Panel title="By state / region (as entered)">
          <Bars data={byState} total={total} />
        </Panel>
      </div>

      {/* coverage */}
      <Panel
        title={`State coverage — ${coverage.covered} covered, ${US_STATES.length - coverage.covered} gaps`}
        right={
          coverage.unrecognised > 0 ? (
            <span className="text-xs text-slate-500">
              {coverage.unrecognised} application(s) with an unrecognised region
            </span>
          ) : undefined
        }
      >
        <CoverageGrid counts={coverage.counts} />
      </Panel>

      {/* full applications */}
      <Panel
        title={`Applications${hasFilters ? ` (${sorted.length} of ${total})` : ` (${total})`}`}
        right={<ExportButton onClick={exportCsv} />}
      >
        <div className="mb-3 flex flex-wrap items-end gap-3 px-1">
          <Filter label="Trade">
            <select className={inputCls} value={fTrade} onChange={(e) => setFTrade(e.target.value)}>
              <option value="">All trades</option>
              {tradeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Filter>
          <Filter label="State / region">
            <select className={inputCls} value={fState} onChange={(e) => setFState(e.target.value)}>
              <option value="">All states</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Filter>
          <Filter label="Min. years">
            <input
              type="number"
              min={0}
              placeholder="e.g. 10"
              className={`${inputCls} w-28`}
              value={fMinYears}
              onChange={(e) => setFMinYears(e.target.value)}
            />
          </Filter>
          {hasFilters && (
            <button
              onClick={() => {
                setFTrade(""); setFState(""); setFMinYears("");
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <Empty>{total === 0 ? "No applications yet." : "No rows match these filters."}</Empty>
        ) : (
          <div className="max-h-[640px] overflow-auto rounded-lg border border-slate-100">
            <table className="tbl w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortTh label="Name" col="full_name" sort={sort} onSort={onSort} />
                  <SortTh label="Trade" col="trade" sort={sort} onSort={onSort} />
                  <SortTh label="State / region" col="state_region" sort={sort} onSort={onSort} />
                  <SortTh label="Years" col="years" sort={sort} onSort={onSort} align="right" />
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-navy">Licence</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-navy">VAT</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-navy">Contact</th>
                  <SortTh label="Applied" col="created_at" sort={sort} onSort={onSort} />
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-navy">Why</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const open = !!expanded[r.id];
                  return (
                    <tr key={r.id} className="border-t border-slate-100 align-top hover:bg-tint/50">
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-navy">{r.full_name}</td>
                      <td className="px-3 py-2">{r.trade ?? "—"}</td>
                      <td className="px-3 py-2">{r.state_region ?? "—"}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {parseYears(r.years_in_trade) ?? r.years_in_trade ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{r.licence_number ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{r.vat_number ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                        <div>{r.email}</div>
                        {r.phone && <div className="text-xs text-slate-400">{r.phone}</div>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fmtDate(r.created_at)}</td>
                      <td className="px-3 py-2 text-slate-600" style={{ minWidth: 220, maxWidth: 360 }}>
                        {r.why_text ? (
                          <>
                            <p className={open ? "" : "line-clamp-2"}>{r.why_text}</p>
                            {r.why_text.length > 90 && (
                              <button
                                onClick={() => setExpanded((e) => ({ ...e, [r.id]: !open }))}
                                className="mt-1 text-xs font-semibold text-blue hover:underline"
                              >
                                {open ? "Show less" : "Show more"}
                              </button>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function CoverageGrid({ counts }: { counts: Map<string, number> }) {
  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const states = US_STATES.filter((s) => (showGapsOnly ? !(counts.get(s) ?? 0) : true));
  return (
    <div>
      <label className="mb-3 flex items-center gap-2 px-1 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showGapsOnly}
          onChange={(e) => setShowGapsOnly(e.target.checked)}
        />
        Show gaps only (states with no applicant)
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {states.map((s) => {
          const n = counts.get(s) ?? 0;
          return (
            <div
              key={s}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                n ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
              }`}
            >
              <span className="truncate text-navy" title={s}>{s}</span>
              {n ? <Badge tone="green">{n}</Badge> : <Badge tone="slate">gap</Badge>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
