/**
 * Early-adopter scarcity counter — "X of 200 spots left".
 *
 * The number is REAL, never faked (Neuromarketing Playbook §6: no fake
 * scarcity). It reads from props derived from EARLY_ADOPTER in site.ts;
 * wire `claimed` to the real signup count when the backend exists.
 */
interface Props {
  total: number;
  claimed: number;
  offer: string;
}

export default function EarlyAdopterCounter({ total, claimed, offer }: Props) {
  const left = Math.max(total - claimed, 0);
  const pct = Math.min(Math.round((claimed / total) * 100), 100);

  return (
    <div className="rounded-2xl border border-blue/20 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="block text-5xl font-extrabold tracking-tight text-navy tabular-nums">
            {left}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-body">
            of {total} founding spots left
          </span>
        </div>
        <span className="rounded-full bg-tint px-4 py-1.5 text-sm font-bold text-blue">
          {offer}
        </span>
      </div>

      <div
        className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-tint"
        role="progressbar"
        aria-valuenow={claimed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${claimed} of ${total} founding spots claimed`}
      >
        <div
          className="h-full rounded-full bg-blue transition-[width] duration-700"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-body">
        First {total} pros get {offer}. Founding members shape what Rex becomes.
      </p>
    </div>
  );
}
