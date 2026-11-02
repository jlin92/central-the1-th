import { motion } from 'framer-motion';
import type { ScoredOffer } from '@/types';
import { factorPriority } from '@/services/sortEngine';
import { cn } from '@/hooks/utils';

const factorColour: Record<string, string> = {
  pinned: 'bg-the1-black',
  affinity: 'bg-primary',
  margin: 'bg-the1-gold',
  popularity: 'bg-[#6b6b73]',
  urgency: 'bg-warning',
  gamification: 'bg-[#7b2ff7]',
};

/**
 * Shows how the sort engine scored the list currently on screen — the
 * weighted factors behind each position, plus what the merchandising rules
 * filtered out. This is the "sorting optimiser" story for presenters.
 */
export function RankingBoard({ ranked, excluded, limit = 6 }: { ranked: ScoredOffer[]; excluded: ScoredOffer[]; limit?: number }) {
  const shown = ranked.slice(0, limit);
  const max = Math.max(1, ...shown.map((s) => s.score));
  const excludedCounts = new Map<string, number>();
  excluded.forEach((s) => excludedCounts.set(s.excluded!, (excludedCounts.get(s.excluded!) ?? 0) + 1));

  if (!shown.length && !excluded.length) return <p className="text-[11px] text-muted">No ranked list on this screen.</p>;

  return (
    <div className="flex flex-col gap-2">
      {shown.map((s, i) => {
        const pinned = s.factors.some((f) => f.key === 'pinned');
        const active = s.factors.filter((f) => f.weight > 0 && f.key !== 'pinned');
        const total = active.reduce((t, f) => t + f.weight, 0) || 1;
        return (
          <motion.div key={s.offer.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className={cn('rounded-xl bg-white p-2.5 ring-1', i === 0 ? 'ring-primary/30' : 'ring-black/[0.05]')}>
            <div className="flex items-center gap-2">
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black', i === 0 ? 'bg-primary text-white' : 'bg-canvas text-muted')}>{i + 1}</span>
              <p className="min-w-0 flex-1 truncate text-[12px] font-bold text-ink">
                {s.offer.brand} · {s.offer.title}
              </p>
              <span className="text-[12px] font-extrabold text-ink">{pinned ? 'PIN' : s.score}</span>
            </div>
            {/* Stacked contribution bar */}
            <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              {pinned ? (
                <div className="h-full w-full bg-the1-black" />
              ) : (
                active.map((f) => (
                  <motion.div key={f.key} className={cn('h-full', factorColour[f.key])} initial={{ width: 0 }} animate={{ width: `${((f.value * f.weight) / total) * (s.score / max) * 100}%` }} transition={{ duration: 0.5, delay: 0.08 * i }} title={`${f.label}: ${Math.round(f.value * 100)} × ${f.weight}`} />
                ))
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
              {factorPriority
                .map((k) => s.factors.find((f) => f.key === k))
                .filter((f): f is NonNullable<typeof f> => !!f && !!f.note && f.weight > 0 && f.value > 0)
                .slice(0, 3)
                .map((f) => (
                  <span key={f.key} className="flex items-center gap-1 text-[10px] text-muted">
                    <span className={cn('h-1.5 w-1.5 rounded-full', factorColour[f.key])} />
                    {f.note}
                  </span>
                ))}
            </div>
          </motion.div>
        );
      })}

      <div className="flex flex-wrap gap-x-2 gap-y-1 px-1 pt-1">
        {Object.entries(factorColour)
          .filter(([k]) => k !== 'pinned')
          .map(([k, c]) => (
            <span key={k} className="flex items-center gap-1 text-[10px] capitalize text-muted">
              <span className={cn('h-1.5 w-1.5 rounded-full', c)} />
              {k === 'margin' ? 'user margin' : k === 'gamification' ? 'earn boost' : k}
            </span>
          ))}
      </div>

      {excluded.length > 0 && (
        <div className="rounded-xl border border-dashed border-black/[0.12] bg-white/60 p-2.5">
          <p className="text-[11px] font-bold text-ink">Filtered out by merchandising rules · {excluded.length}</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {[...excludedCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([reason, n]) => (
                <li key={reason} className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {reason} · {n}
                </li>
              ))}
          </ul>
          <p className="mt-1.5 truncate text-[10px] text-muted">
            e.g. {excluded.slice(0, 3).map((s) => `${s.offer.brand} ${s.offer.title}`).join(' · ')}
          </p>
        </div>
      )}
    </div>
  );
}
