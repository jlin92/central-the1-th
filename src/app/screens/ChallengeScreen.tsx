import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { SectionHeader, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { challengesForTab } from '@/services/selectors';
import { primaryReason, topSessionAffinity } from '@/services/sortEngine';
import { formatPoints, formatThb } from '@/hooks/utils';

/** Chapter 6 — Challenge tab: joined missions with progress, then ranked missions to join. */
export function ChallengeScreen() {
  const { rankContext, joined, sortMode, setRanking, openWhy, points, appUserProfile, sessionAffinity, openDetail } = useDemo();
  const data = useMemo(() => challengesForTab(rankContext, joined), [rankContext, joined]);
  const live = topSessionAffinity(sessionAffinity);

  useEffect(() => {
    setRanking({ title: 'Challenges', ranked: data.ranked, excluded: data.excluded });
    return () => setRanking(null);
  }, [data, setRanking]);

  const reasonFor = (i: number) => primaryReason(data.ranked[i]);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        {points < 1000 && (
          <div className="flex items-center gap-3 rounded-2xl bg-the1-black p-3 text-white">
            <Icon name="rocket_launch" filled className="text-[26px]" />
            <p className="text-[12px] leading-snug">
              <span className="font-bold">Fastest way to your first points.</span> Join a challenge — no points needed — and bonus points land after your first shop.
            </p>
          </div>
        )}

        {data.joined.length > 0 && (
          <section>
            <SectionHeader title="Your challenges" />
            <div className="mt-2 flex flex-col gap-2">
              {data.joined.map((o, i) => {
                const spent = joined[o.id] ?? 0;
                const target = o.minSpendThb ?? 0;
                const pct = target ? Math.min(100, (spent / target) * 100) : spent > 0 ? 100 : 0;
                const complete = pct >= 100;
                return (
                  <motion.button key={o.id} type="button" onClick={() => openDetail(o)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card">
                    <BrandTile brandId={o.brandId} className="h-14 w-20 shrink-0 rounded-lg" size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-[14px] font-bold text-on-surface">{o.title}</p>
                      <p className="truncate text-[11px] text-on-surface-variant">{o.subtitle}</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                        <div className={complete ? 'h-full bg-success' : 'h-full bg-primary'} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-on-surface-variant">
                        {complete ? `Complete · ${formatPoints(o.rewardPoints ?? 0)} points on the way` : target ? `${formatThb(spent)} of ${formatThb(target)} · ${formatThb(target - spent)} to go` : 'Joined · shop to progress'}
                      </p>
                    </div>
                    <Icon name={complete ? 'check_circle' : 'chevron_right'} filled={complete} className={complete ? 'text-success' : 'text-on-surface-variant'} />
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        <SortIndicator
          live={sortMode === 'dy' && !!live}
          label={sortMode === 'dy' ? (appUserProfile.homeVariant === 'newMember' ? 'Sorted for you · easiest to earn first' : 'Sorted for you · your brands first') : 'The 1 today · newest first'}
          onWhy={openWhy}
        />

        <section>
          <SectionHeader title={data.joined.length ? 'More challenges' : 'Challenges'} />
          <div className="mt-2 flex flex-col gap-2">
            {data.ranked.map((s, i) => (
              <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="challenge" reason={sortMode === 'dy' ? reasonFor(i) : undefined} />
            ))}
          </div>
        </section>

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>
  );
}
