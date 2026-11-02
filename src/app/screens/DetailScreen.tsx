import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard, autoBadge } from '@/components/offers/OfferCard';
import { useOfferAction } from '@/components/offers/useOfferAction';
import { SectionHeader, WhyButton } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { pointsPerBaht, offerValueThb } from '@/mock-data/offers';
import { challengeToAfford, relatedOffers } from '@/services/selectors';
import type { Offer } from '@/types';
import { cn, formatPoints, formatThb, shortDate } from '@/hooks/utils';

/** Chapter 4 — Offer detail: eligibility, value, next-best action. */
export function DetailScreen() {
  const { detailItem, goToChapter } = useDemo();
  if (!detailItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface px-8 text-center">
        <Icon name="confirmation_number" className="text-[40px] text-primary" />
        <p className="font-heading text-lg font-bold text-on-surface">No offer selected</p>
        <button type="button" onClick={() => goToChapter(chapterIdByKey('search'))} className="mt-1 rounded-md bg-the1-black px-5 py-2.5 text-sm font-semibold text-white">
          Browse coupons
        </button>
      </div>
    );
  }
  return <DetailBody o={detailItem} />;
}

function DetailBody({ o }: { o: Offer }) {
  const { points, rankContext, openWhy, askMuse, location, joined, joinChallenge } = useDemo();
  const action = useOfferAction(o);
  const badge = autoBadge(o);
  const here = location && o.brandId === location.brandId && o.channel.includes('In-store');
  const ppb = pointsPerBaht(o);
  const value = offerValueThb(o);
  const gap = o.pointsCost - points;
  const helper = gap > 0 ? challengeToAfford(o, rankContext) : null;
  const related = relatedOffers(o, rankContext, 3);
  const isChallenge = o.offerType === 'Challenge';
  const progress = joined[o.id];

  return (
    <Screen>
      <div className="relative">
        <BrandTile brandId={o.brandId} className="h-44 w-full" size="lg" />
        <div className="absolute right-3 top-3">
          <WhyButton onClick={openWhy} dark />
        </div>
        {(here || badge) && (
          <span className={cn('absolute bottom-3 left-3 rounded px-2 py-1 text-[11px] font-bold text-white', here ? 'bg-success' : 'bg-primary')}>
            {here ? `Use here · ${location!.store} ${location!.branch}` : badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 px-3 pt-3">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <span className="inline-block rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">{o.offerType}</span>
          <p className="mt-2 text-[12px] uppercase tracking-wide text-on-surface-variant">{o.brand}</p>
          <h1 className="font-heading text-[24px] font-bold leading-tight text-on-surface">{o.title}</h1>
          {o.subtitle && <p className="mt-1 text-[13px] text-on-surface-variant">{o.subtitle}</p>}

          <ul className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-on-surface-variant">
            <li className="flex items-center gap-1.5">
              <Icon name="event" className="text-[16px]" />
              Valid until {shortDate(o.validUntil)}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name={o.channel === 'Online' ? 'language' : 'storefront'} className="text-[16px]" />
              {o.channel}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="person" className="text-[16px]" />
              {o.memberLevel === 'All' ? 'All members' : o.memberLevel}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="group" className="text-[16px]" />
              {o.redemptions.toLocaleString('en-US')} redeemed · 30d
            </li>
          </ul>

          {/* Points-cost perks: value panel (user margin) */}
          {o.pointsCost > 0 && (
            <div className="mt-3 rounded-xl bg-surface p-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-on-surface-variant">Points required</p>
                  <p className="font-heading text-[20px] font-bold text-on-surface">{formatPoints(o.pointsCost)}</p>
                </div>
                {value && (
                  <div className="text-right">
                    <p className="text-[11px] text-on-surface-variant">Value</p>
                    <p className="font-heading text-[20px] font-bold text-on-surface">≈{formatThb(value)}</p>
                  </div>
                )}
              </div>
              {ppb != null && (
                <p className={cn('mt-2 flex items-center gap-1 text-[12px] font-semibold', ppb < settings.pointsPerBaht ? 'text-success' : 'text-on-surface-variant')}>
                  <Icon name={ppb < settings.pointsPerBaht ? 'trending_up' : 'info'} className="text-[15px]" />
                  {ppb} points per ฿1{ppb < settings.pointsPerBaht ? ` — better than the ${settings.pointsPerBaht}:1 universal cash rate` : ` — same as the universal cash rate`}
                </p>
              )}
              <p className="mt-1 text-[11px] text-on-surface-variant">
                You have {formatPoints(points)} points{gap > 0 ? ` · ${formatPoints(gap)} short` : ' · enough to redeem now'}
              </p>
            </div>
          )}

          {/* Challenge progress */}
          {isChallenge && progress != null && o.minSpendThb ? (
            <div className="mt-3 rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-on-surface">Your progress</span>
                <span className="text-on-surface-variant">
                  {formatThb(progress)} / {formatThb(o.minSpendThb)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (progress / o.minSpendThb) * 100)}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-on-surface-variant">
                {formatThb(Math.max(0, o.minSpendThb - progress))} to go · earns {formatPoints(o.rewardPoints ?? 0)} points
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={action.run}
            disabled={action.state === 'disabled'}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-1.5 rounded-md py-3 text-[14px] font-semibold',
              action.state === 'primary' && 'bg-the1-black text-white',
              action.state === 'done' && 'bg-the1-green-soft text-success',
              action.state === 'disabled' && 'bg-surface-container text-on-surface-variant',
            )}
          >
            {action.state === 'done' && <Icon name="check" className="text-[18px]" />}
            {action.label}
            {o.pointsCost > 0 && action.state === 'primary' && ` · ${formatPoints(o.pointsCost)} points`}
          </button>
          {action.note && <p className="mt-1.5 text-center text-[12px] text-on-surface-variant">{action.note}</p>}
        </section>

        {/* Not enough points → gamification next-best action */}
        {helper && (
          <section className="rounded-2xl border border-primary/20 bg-primary-fixed p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-primary">
              <Icon name="flag" filled className="text-[16px]" />
              Earn the {formatPoints(gap)} points you need
            </p>
            <div className="mt-2">
              <OfferCard offer={helper} variant="challenge" reason="Recommended because you’re short of points" />
            </div>
            {joined[helper.id] == null && (
              <button type="button" onClick={() => joinChallenge(helper)} className="mt-2 w-full rounded-md bg-the1-black py-2.5 text-[13px] font-semibold text-white">
                Join challenge
              </button>
            )}
          </section>
        )}

        {/* How to use */}
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <p className="font-heading text-[14px] font-bold text-on-surface">How to use</p>
          <ol className="mt-2 flex flex-col gap-2 text-[12px] text-on-surface-variant">
            {(isChallenge
              ? ['Tap Join — no points needed.', `Shop ${o.minSpendThb ? formatThb(o.minSpendThb) : ''} at ${o.brand} and scan your The 1 QR.`, `Bonus points land within 3 days.`]
              : [o.pointsCost > 0 ? `Tap Redeem to exchange ${formatPoints(o.pointsCost)} points.` : 'Tap Get — the coupon drops into My Coupons.', 'Show your The 1 QR at checkout.', 'The discount applies automatically and you still earn points.']
            ).map((s, i) => (
              <li key={s} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-the1-black text-[10px] font-bold text-white">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <button type="button" onClick={() => askMuse(`Is ${o.brand} ${o.title} a good deal for me?`)} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-card">
          <span className="flex h-9 w-9 items-center justify-center rounded-full muse-gradient text-white">
            <Icon name="auto_awesome" filled className="text-[18px]" />
          </span>
          <span className="flex-1 text-[13px] font-semibold text-on-surface">Is this a good deal for me? Ask The 1 assistant</span>
          <Icon name="chevron_right" className="text-on-surface-variant" />
        </button>

        {related.length > 0 && (
          <section>
            <SectionHeader title="You may also like" />
            <div className="mt-2 flex flex-col gap-2">
              {related.map((r, i) => (
                <OfferCard key={r.id} offer={r} index={i} variant="row" />
              ))}
            </div>
          </section>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>
  );
}
