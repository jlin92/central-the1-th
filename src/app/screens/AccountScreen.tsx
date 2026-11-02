import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { TierBadge } from '@/components/layout/HeaderBar';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { cn, formatPoints, formatThb } from '@/hooks/utils';

const tierProgress: Record<string, { next: string; spent: number; target: number }> = {
  'Level 1': { next: 'Level 2', spent: 0, target: 30000 },
  'Level 2': { next: 'Level 3', spent: 48000, target: 100000 },
  'Level 3': { next: 'The 1 Exclusive', spent: 138400, target: 300000 },
  'The 1 Exclusive': { next: 'The 1 Exclusive', spent: 1, target: 1 },
};

/** Chapter 8 — Account: member card, level progress, points history, benefits. */
export function AccountScreen() {
  const { appUserProfile, points, wallet, usedIds, goToChapter, setQrOpen } = useDemo();
  const p = appUserProfile;
  const prog = tierProgress[p.tier];
  const pct = Math.min(100, (prog.spent / prog.target) * 100);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Member card */}
        <section className="relative overflow-hidden rounded-2xl bg-the1-black p-4 text-white">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/70" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/70">The 1 member</p>
              <p className="font-heading text-[18px] font-bold">{p.name}</p>
              <p className="text-[11px] text-white/70">Member since {p.memberSince}</p>
            </div>
            <TierBadge />
          </div>
          <div className="relative mt-4 flex items-end justify-between">
            <div>
              <p className="font-heading text-[28px] font-bold leading-none">{formatPoints(points)}</p>
              <p className="text-[12px] text-white/80">points · ≈{formatThb(points / settings.pointsPerBaht)}</p>
            </div>
            <button type="button" onClick={() => setQrOpen(true)} className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-[12px] font-semibold text-on-surface">
              <Icon name="qr_code_2" className="text-[16px]" />
              My QR
            </button>
          </div>
        </section>

        {/* Level progress */}
        {prog.target > 1 && (
          <section className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-heading text-[14px] font-bold text-on-surface">{p.tier} → {prog.next}</p>
              <span className="text-[12px] text-on-surface-variant">
                {formatThb(prog.spent)} / {formatThb(prog.target)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-on-surface-variant">
              {p.homeVariant === 'newMember' ? 'Spend at any Central Group store to start climbing — Level 2 unlocks parking and lounge perks.' : `Spend ${formatThb(prog.target - prog.spent)} more this year to reach ${prog.next}.`}
            </p>
          </section>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat icon="confirmation_number" label="Coupons" value={String(wallet.filter((id) => !usedIds.includes(id)).length)} onClick={() => goToChapter(chapterIdByKey('coupons'))} />
          <Stat icon="hourglass_top" label="Expiring" value={p.expiringPoints ? formatPoints(p.expiringPoints.amount) : '0'} onClick={() => goToChapter(chapterIdByKey('redeem'))} />
          <Stat icon="credit_card" label="REDZ card" value={p.hasRedzCard ? 'Linked' : 'Apply'} onClick={() => goToChapter(chapterIdByKey('search'))} />
        </div>

        {/* Points history */}
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <p className="font-heading text-[14px] font-bold text-on-surface">Points history</p>
          <ul className="mt-2 divide-y divide-surface-container-high">
            {p.pointsHistory.map((e) => (
              <li key={`${e.title}-${e.detail}`} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-on-surface">
                  <Icon name={e.icon} className="text-[20px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-on-surface">{e.title}</span>
                  <span className="block truncate text-[11px] text-on-surface-variant">{e.detail}</span>
                </span>
                <span className={cn('text-[13px] font-bold', e.points > 0 ? 'text-success' : 'text-on-surface-variant')}>{e.points > 0 ? `+${formatPoints(e.points)}` : '—'}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Member benefits */}
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <p className="font-heading text-[14px] font-bold text-on-surface">Member benefits</p>
          <ul className="mt-2 divide-y divide-surface-container-high">
            {p.benefits.map((b) => (
              <li key={b.title} className="flex items-start gap-3 py-2.5">
                <Icon name={b.icon} className="mt-0.5 text-[22px] text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-on-surface">
                    {b.title}
                    {b.tag && <span className="rounded bg-the1-gold-soft px-1.5 py-0.5 text-[10px] font-bold text-the1-gold">{b.tag}</span>}
                  </span>
                  <span className="block text-[11px] text-on-surface-variant">{b.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Disclaimer className="px-1">{settings.disclaimers.illustrative}</Disclaimer>
      </div>
    </Screen>
  );
}

function Stat({ icon, label, value, onClick }: { icon: string; label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-start rounded-2xl bg-white p-3 text-left shadow-card">
      <Icon name={icon} className="text-[20px] text-primary" />
      <span className="mt-1 font-heading text-[16px] font-bold text-on-surface">{value}</span>
      <span className="text-[11px] text-on-surface-variant">{label}</span>
    </button>
  );
}
