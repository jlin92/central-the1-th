import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { Chip, SectionHeader, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { brandStyle, offersByBrand, topsHubOffers } from '@/mock-data/offers';
import { primaryReason, rankOffers } from '@/services/sortEngine';
import type { Offer, ScoredOffer } from '@/types';
import { cn } from '@/hooks/utils';

const storeCount: Record<string, string> = {
  tops: '230+ stores · Tops, Tops daily, Tops Online, Central Food Hall',
  'central-department-store': '24 department stores nationwide',
  robinson: '50+ stores nationwide',
  'power-buy': '90+ stores nationwide',
  supersports: '80+ stores nationwide',
  sephora: '20 stores + online',
  starbucks: '480+ stores nationwide',
};

const formatOrder = ['Tops', 'Tops daily', 'Tops Online', 'Central Food Hall', 'Tops Wholesale', 'Tops Care'];

/** Chapter 3 — Brand hub (e.g. Tops) with dynamically sorted offers. */
export function BrandHubScreen() {
  const { brandId, rankContext, sortMode, setRanking, openWhy, goToChapter, trackAffinity } = useDemo();
  const style = brandStyle(brandId);
  const isTops = brandId === 'tops';
  const [format, setFormat] = useState<string>('all');

  useEffect(() => setFormat('all'), [brandId]);

  const pool = useMemo<Offer[]>(() => (isTops ? topsHubOffers() : offersByBrand(brandId)), [brandId, isTops]);
  const formats = useMemo(
    () => (isTops ? ([...new Set(pool.map((o) => o.storeFormat).filter(Boolean))] as string[]).sort((a, b) => formatOrder.indexOf(a) - formatOrder.indexOf(b)) : []),
    [pool, isTops],
  );

  const coupons = useMemo(() => {
    const list = pool.filter((o) => ['Coupon', 'Phrom Pay Coupon'].includes(o.offerType) && (format === 'all' || o.storeFormat === format));
    return rankOffers(list, rankContext, { diversify: false });
  }, [pool, format, rankContext]);
  const challenges = useMemo(() => rankOffers(pool.filter((o) => o.offerType === 'Challenge'), rankContext, { diversify: false }), [pool, rankContext]);
  const redeem = useMemo(() => rankOffers(pool.filter((o) => o.offerType === 'Redeem Cash' || o.offerType === 'Redeem Points'), rankContext, { diversify: false }), [pool, rankContext]);

  useEffect(() => {
    setRanking({ title: `${style.label} coupons`, ranked: coupons.ranked, excluded: coupons.excluded });
    return () => setRanking(null);
  }, [coupons, setRanking, style.label]);

  const reasonFor = (s: ScoredOffer) => primaryReason(s);
  const onlineHidden = coupons.excluded.filter((s) => s.excluded?.startsWith('Online')).length;

  return (
    <Screen>
      {/* Brand header */}
      <div className="relative">
        <BrandTile brandId={brandId} className="h-28 w-full" size="lg" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="-mt-5 mx-3 rounded-2xl bg-white p-3 shadow-card">
        <div className="flex items-center gap-3">
          <BrandTile brandId={brandId} round size="xs" className="h-12 w-12 ring-2 ring-white" />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-[17px] font-bold text-on-surface">{style.label}</h1>
            <p className="truncate text-[11px] text-on-surface-variant">{storeCount[brandId] ?? 'Central Group partner'}</p>
          </div>
          <button type="button" onClick={() => trackAffinity(`brand:${brandId}`, 1)} className="rounded-md border border-on-surface px-3 py-1.5 text-[12px] font-semibold text-on-surface">
            Follow
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Store-format filter for the Tops family */}
        {isTops && (
          <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3">
            <Chip label="All" active={format === 'all'} onClick={() => setFormat('all')} />
            {formats.map((f) => (
              <Chip key={f} label={f} active={format === f} onClick={() => setFormat(f)} />
            ))}
          </div>
        )}

        <SortIndicator live={false} label={sortMode === 'dy' ? 'Sorted for you by Dynamic Yield' : 'The 1 today · newest first, no filtering'} onWhy={openWhy} />

        {sortMode === 'dy' && coupons.excluded.length > 0 && (
          <button type="button" onClick={openWhy} className="flex items-center gap-1.5 self-start text-[12px] text-on-surface-variant">
            <Icon name="visibility_off" className="text-[14px]" />
            {coupons.excluded.length} hidden
            {onlineHidden > 0 && ` · ${onlineHidden} online-only`}
            {' · '}
            {[...new Set(coupons.excluded.map((s) => s.excluded!))].slice(0, 3).join(', ').toLowerCase()}
          </button>
        )}

        <section>
          <SectionHeader title="Coupons" />
          <motion.div key={`${brandId}-${format}-${sortMode}-${coupons.ranked.map((s) => s.offer.id).slice(0, 4).join(',')}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 grid grid-cols-2 gap-3">
            {coupons.ranked.map((s, i) => (
              <OfferCard key={s.offer.id} offer={s.offer} index={i} variant={s.offer.pointsCost > 0 ? 'perk' : 'coupon'} reason={sortMode === 'dy' ? reasonFor(s) : undefined} badge={isTops && s.offer.storeFormat && s.offer.storeFormat !== 'Tops' ? s.offer.storeFormat : undefined} />
            ))}
          </motion.div>
          {coupons.ranked.length === 0 && <p className="mt-2 rounded-xl bg-white p-4 text-center text-[12px] text-on-surface-variant shadow-card">Nothing usable right now.</p>}
        </section>

        {challenges.ranked.length > 0 && (
          <section>
            <SectionHeader title="Challenges" action="All" onAction={() => goToChapter(chapterIdByKey('challenge'))} />
            <div className="mt-2 flex flex-col gap-2">
              {challenges.ranked.slice(0, 3).map((s, i) => (
                <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="challenge" reason={sortMode === 'dy' ? reasonFor(s) : undefined} />
              ))}
            </div>
          </section>
        )}

        {redeem.ranked.length > 0 && (
          <section>
            <SectionHeader title="Redeem with points" action="Redeem Cash" onAction={() => goToChapter(chapterIdByKey('redeem'))} />
            <div className={cn('mt-2 grid grid-cols-2 gap-3')}>
              {redeem.ranked.slice(0, 4).map((s, i) => (
                <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="perk" reason={sortMode === 'dy' ? s.factors.find((f) => f.key === 'margin')?.note : undefined} />
              ))}
            </div>
          </section>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>
  );
}
