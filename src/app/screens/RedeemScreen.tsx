import { useEffect, useMemo } from 'react';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { OfferCard } from '@/components/offers/OfferCard';
import { SectionHeader, WhyButton } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { pointsPerBaht } from '@/mock-data/offers';
import { bestValue, challengesForHome, redeemOptions } from '@/services/selectors';
import { formatPoints, formatThb } from '@/hooks/utils';

/** Chapter 7 — Redeem Cash: points → cash coupons, with DY's best-value ranking. */
export function RedeemScreen() {
  const { points, appUserProfile, rankContext, setRanking, openWhy, goToChapter } = useDemo();
  const p = appUserProfile;
  const baht = points / settings.pointsPerBaht;
  const value = useMemo(() => bestValue(rankContext, 6), [rankContext]);
  const options = useMemo(() => redeemOptions(rankContext), [rankContext]);
  const cash = options.ranked.filter((s) => s.offer.offerType === 'Redeem Cash');
  const earn = useMemo(() => challengesForHome(rankContext, 3), [rankContext]);

  useEffect(() => {
    setRanking({ title: 'Redeem with points', ranked: options.ranked, excluded: options.excluded });
    return () => setRanking(null);
  }, [options, setRanking]);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Balance hero */}
        <section className="rounded-2xl bg-the1-black p-4 text-white">
          <p className="text-[12px] text-white/80">Your points</p>
          <div className="flex items-baseline gap-2">
            <p className="font-heading text-[32px] font-bold leading-none">{formatPoints(points)}</p>
            <p className="text-[14px] text-white/85">≈ {formatThb(baht)} cash</p>
          </div>
          <p className="mt-1 text-[11px] text-white/70">{settings.pointsPerBaht} points = ฿1 on universal cash coupons</p>
          {p.expiringPoints && points >= p.expiringPoints.amount && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-[12px]">
              <Icon name="hourglass_top" className="text-[18px]" />
              <span>
                <span className="font-bold">{formatPoints(p.expiringPoints.amount)} points</span> expire {p.expiringPoints.when} — that’s {formatThb(p.expiringPoints.amount / settings.pointsPerBaht)} you’d lose
              </span>
            </div>
          )}
        </section>

        {points === 0 ? (
          <section className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-heading text-[15px] font-bold text-on-surface">Earn points first — it’s quick</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">Join a challenge now and your first shop earns bonus points. Then come back here to turn them into cash.</p>
            <div className="mt-3 flex flex-col gap-2">
              {earn.map((o, i) => (
                <OfferCard key={o.id} offer={o} index={i} variant="challenge" />
              ))}
            </div>
            <button type="button" onClick={() => goToChapter(chapterIdByKey('challenge'))} className="mt-3 w-full rounded-md bg-the1-black py-2.5 text-[13px] font-semibold text-white">
              See all challenges
            </button>
          </section>
        ) : (
          <>
            {/* Best value (custom algorithm) */}
            <section className="rounded-2xl bg-white p-3 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[15px] font-bold text-on-surface">Best value for your points</h2>
                <WhyButton onClick={openWhy} />
              </div>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Ranked by value per point — partner perks that beat {settings.pointsPerBaht}:1 come first</p>
              <div className="mt-2.5 flex flex-col gap-2">
                {value.map((s, i) => {
                  const ppb = pointsPerBaht(s.offer);
                  return (
                    <OfferCard
                      key={s.offer.id}
                      offer={s.offer}
                      index={i}
                      variant="row"
                      reason={ppb != null ? `${ppb} pts per ฿1${ppb < settings.pointsPerBaht ? ` · ${Math.round((1 - ppb / settings.pointsPerBaht) * 100)}% better than cash` : ''}` : undefined}
                    />
                  );
                })}
              </div>
            </section>

            {/* Cash coupons by brand */}
            <section>
              <SectionHeader title="Cash coupons" />
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Your brands first · only what your balance covers</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {cash.slice(0, 8).map((s, i) => (
                  <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="perk" reason={s.factors.find((f) => f.key === 'affinity' && f.note)?.note} />
                ))}
              </div>
            </section>

            {options.excluded.length > 0 && (
              <button type="button" onClick={openWhy} className="flex items-center gap-1.5 self-start px-1 text-[12px] text-on-surface-variant">
                <Icon name="visibility_off" className="text-[14px]" />
                {options.excluded.length} options hidden — above your balance or already redeemed
              </button>
            )}
          </>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.redeem}</Disclaimer>
      </div>
    </Screen>
  );
}
