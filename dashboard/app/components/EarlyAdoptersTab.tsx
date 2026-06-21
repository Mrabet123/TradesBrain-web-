"use client";
import { useMemo, useState } from "react";
import type { EarlyAdopter } from "@/lib/types";
import { countBy, countLastDays, crossTab, withinLastDays } from "@/lib/analyze";
import { downloadCsv, fmtDate } from "@/lib/csv";
import { EARLY_ADOPTER_SPOTS } from "@/lib/states";
import { Bars, Card, Empty, ExportButton, Panel, SortTh, inputCls } from "./ui";

type SortCol = "name" | "email" | "trade" | "state" | "user_type" | "created_at";

export default function EarlyAdoptersTab({ rows }: { rows: EarlyAdopter[] }) {
  const [fTrade, setFTrade] = useState("");
  const [fState, setFState] = useState("");
  const [fType, setFType] = useState("");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [sort, setSort] = useState<{ col: SortCol; dir: "asc" | "desc" }>({
    col: "created_at",
    dir: "desc",
  });

  const total = rows.length;
  const byTrade = useMemo(() => countBy(rows, (r) => r.trade), [rows]);
  const byType = useMemo(() => countBy(rows, (r) => r.user_type), [rows]);
  const byState = useMemo(() => countBy(rows, (r) => r.state), [rows]);
  const last7 = useMemo(() => countLastDays(rows, (r) => r.created_at, 7), [rows]);
  const cross = useMemo(
    () => crossTab(rows, (r) => r.trade || "—", (r) => r.state || "—"),
    [rows]
  );

  const tradeOptions = useMemo(() => byTrade.map((d) => d.key).filter((k) => k !== "—"), [byTrade]);
  const stateOptions = useMemo(
    () => byState.map((d) => d.key).filter((k) => k !== "—").sort(),
    [byState]
  );
  const typeOptions = useMemo(() => byType.map((d) => d.key).filter((k) => k !== "—"), [byType]);

  const filtered = useMemo(() => {
    const fromT = fFrom ? new Date(fFrom).getTime() : null;
    const toT = fTo ? new Date(fTo).getTime() + 24 * 60 * 60 * 1000 - 1 : null;
    return rows.filter((r) => {
      if (fTrade && r.trade !== fTrade) return false;
      if (fState && r.state !== fState) return false;
      if (fType && r.user_type !== fType) return false;
      const t = new Date(r.created_at).getTime();
      if (fromT && t < fromT) return false;
      if (toT && t > toT) return false;
      return true;
    });
  }, [rows, fTrade, fState, fType, fFrom, fTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number = a[sort.col] ?? "";
      let bv: string | number = b[sort.col] ?? "";
      if (sort.col === "created_at") {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  function onSort(col: string) {
    setSort((s) =>
      s.col === col ? { col: s.col, dir: s.dir === "asc" ? "desc" : "asc" } : { col: col as SortCol, dir: "asc" }
    );
  }

  function exportCsv() {
    downloadCsv(
      "early_adopters.csv",
      ["Name", "Email", "Trade", "State", "User type", "Source", "Signed up"],
      sorted.map((r) => [r.name, r.email, r.trade, r.state, r.user_type, r.source ?? "", r.created_at])
    );
  }

  const spotsPct = Math.min(100, Math.round((total / EARLY_ADOPTER_SPOTS) * 100));
  const hasFilters = fTrade || fState || fType || fFrom || fTo;

  return (
    <div className="space-y-6">
      {/* summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          label="Total signups"
          value={total}
          sub={`${total} of ${EARLY_ADOPTER_SPOTS} spots used (${spotsPct}%)`}
          accent
        />
        <Card
          label="Spots remaining"
          value={Math.max(0, EARLY_ADOPTER_SPOTS - total)}
          sub={`of ${EARLY_ADOPTER_SPOTS} early-adopter spots`}
        />
        <Card label="Last 7 days" value={last7} sub="signup velocity" />
        <Card
          label="Distinct states"
          value={byState.filter((s) => s.key !== "—").length}
          sub={`${tradeOptions.length} trades represented`}
        />
      </div>

      {/* breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="By trade">
          <Bars data={byTrade} total={total} />
        </Panel>
        <Panel title="By user type">
          <Bars data={byType} total={total} />
        </Panel>
      </div>

      {/* per-state + cross table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Signups by state">
          <StateTable data={byState} total={total} />
        </Panel>
        <Panel title="Trade × State (GTM concentration)">
          {cross.total === 0 ? (
            <Empty />
          ) : (
            <div className="max-h-[420px] overflow-auto">
              <table className="tbl w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-navy">
                      Trade ＼ State
                    </th>
                    {cross.colKeys.map((c) => (
                      <th key={c} className="px-3 py-2 text-center text-xs font-bold text-navy" title={c}>
                        {c}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-blue">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cross.rowKeys.map((rk) => (
                    <tr key={rk} className="border-t border-slate-100">
                      <td className="whitespace-nowrap px-3 py-2 font-semibold text-navy">{rk}</td>
                      {cross.colKeys.map((ck) => {
                        const n = cross.matrix[rk]?.[ck] ?? 0;
                        return (
                          <td key={ck} className="px-3 py-2 text-center tabular-nums">
                            {n ? (
                              <span
                                className="inline-block rounded px-1.5 font-semibold text-navy"
                                style={{ backgroundColor: heat(n, cross.total) }}
                              >
                                {n}
                              </span>
                            ) : (
                              <span className="text-slate-300">·</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold tabular-nums text-blue">
                        {cross.rowTotals[rk]}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-3 py-2 text-xs font-bold uppercase text-slate-500">Total</td>
                    {cross.colKeys.map((ck) => (
                      <td key={ck} className="px-3 py-2 text-center font-bold tabular-nums text-navy">
                        {cross.colTotals[ck]}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-extrabold tabular-nums text-blue">
                      {cross.total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* full records */}
      <Panel
        title={`All signups${hasFilters ? ` (${sorted.length} of ${total})` : ` (${total})`}`}
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
          <Filter label="State">
            <select className={inputCls} value={fState} onChange={(e) => setFState(e.target.value)}>
              <option value="">All states</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Filter>
          <Filter label="User type">
            <select className={inputCls} value={fType} onChange={(e) => setFType(e.target.value)}>
              <option value="">All types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Filter>
          <Filter label="From">
            <input type="date" className={inputCls} value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          </Filter>
          <Filter label="To">
            <input type="date" className={inputCls} value={fTo} onChange={(e) => setFTo(e.target.value)} />
          </Filter>
          {hasFilters && (
            <button
              onClick={() => {
                setFTrade(""); setFState(""); setFType(""); setFFrom(""); setFTo("");
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <Empty>{total === 0 ? "No signups yet." : "No rows match these filters."}</Empty>
        ) : (
          <div className="max-h-[600px] overflow-auto rounded-lg border border-slate-100">
            <table className="tbl w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortTh label="Name" col="name" sort={sort} onSort={onSort} />
                  <SortTh label="Email" col="email" sort={sort} onSort={onSort} />
                  <SortTh label="Trade" col="trade" sort={sort} onSort={onSort} />
                  <SortTh label="State" col="state" sort={sort} onSort={onSort} />
                  <SortTh label="User type" col="user_type" sort={sort} onSort={onSort} />
                  <SortTh label="Signed up" col="created_at" sort={sort} onSort={onSort} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-tint/50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-navy">{r.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">{r.email}</td>
                    <td className="px-3 py-2">{r.trade}</td>
                    <td className="px-3 py-2">{r.state}</td>
                    <td className="px-3 py-2">{r.user_type}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
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

function StateTable({ data, total }: { data: { key: string; count: number }[]; total: number }) {
  const [sort, setSort] = useState<{ col: "state" | "count"; dir: "asc" | "desc" }>({
    col: "count",
    dir: "desc",
  });
  const rows = data.filter((d) => d.key !== "—");
  const sorted = [...rows].sort((a, b) => {
    if (sort.col === "state") {
      return sort.dir === "asc" ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
    }
    return sort.dir === "asc" ? a.count - b.count : b.count - a.count;
  });
  if (rows.length === 0) return <Empty />;
  return (
    <div className="max-h-[420px] overflow-auto">
      <table className="tbl w-full border-collapse text-sm">
        <thead>
          <tr>
            <SortTh label="State" col="state" sort={sort} onSort={(c) => toggle(c as "state" | "count")} />
            <SortTh label="Signups" col="count" sort={sort} onSort={(c) => toggle(c as "state" | "count")} align="right" />
            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-navy">Share</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.key} className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-navy">{r.key}</td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.count}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-500">
                {total ? `${Math.round((r.count / total) * 100)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function toggle(col: "state" | "count") {
    setSort((s) => (s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: col === "state" ? "asc" : "desc" }));
  }
}

// Light blue heat shading for the cross-table cells.
function heat(n: number, total: number): string {
  const intensity = Math.min(0.85, 0.12 + (n / Math.max(1, total)) * 4);
  return `rgba(46,117,182,${intensity.toFixed(2)})`;
}
