// Pure aggregation helpers. Client-safe (no secrets, no server imports). All
// figures are derived from the live rows passed in — nothing hardcoded.

export interface Count {
  key: string;
  count: number;
}

export function countBy<T>(rows: T[], pick: (r: T) => string | null | undefined): Count[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const raw = pick(r);
    const key = raw && String(raw).trim() !== "" ? String(raw).trim() : "—";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function withinLastDays(iso: string, days: number, now = Date.now()): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return now - t <= days * 24 * 60 * 60 * 1000;
}

export function countLastDays<T>(rows: T[], pick: (r: T) => string, days: number, now = Date.now()): number {
  return rows.reduce((n, r) => (withinLastDays(pick(r), days, now) ? n + 1 : n), 0);
}

/** Parse free-text years-of-experience ("14", "20+ yrs") into a number. */
export function parseYears(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = String(value).match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Build a trade × state matrix: rows = trades, cols = states, with totals. */
export function crossTab<T>(
  rows: T[],
  rowPick: (r: T) => string,
  colPick: (r: T) => string
): { rowKeys: string[]; colKeys: string[]; matrix: Record<string, Record<string, number>>; rowTotals: Record<string, number>; colTotals: Record<string, number>; total: number } {
  const matrix: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let total = 0;

  for (const r of rows) {
    const rk = (rowPick(r) || "—").trim() || "—";
    const ck = (colPick(r) || "—").trim() || "—";
    matrix[rk] ??= {};
    matrix[rk][ck] = (matrix[rk][ck] ?? 0) + 1;
    rowTotals[rk] = (rowTotals[rk] ?? 0) + 1;
    colTotals[ck] = (colTotals[ck] ?? 0) + 1;
    total++;
  }

  const rowKeys = Object.keys(rowTotals).sort((a, b) => rowTotals[b] - rowTotals[a] || a.localeCompare(b));
  const colKeys = Object.keys(colTotals).sort((a, b) => colTotals[b] - colTotals[a] || a.localeCompare(b));
  return { rowKeys, colKeys, matrix, rowTotals, colTotals, total };
}
