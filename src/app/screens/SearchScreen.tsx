import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { OfferCard } from '@/components/offers/OfferCard';
import { BrandTile } from '@/components/offers/BrandTile';
import { Chip, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { brandStyle, catalogue, categoryChips, chipAffinity, chipById, expandQuery, isGiftQuery, popularCoupons, searchOffers } from '@/mock-data/offers';
import { primaryReason, rankOffers, topSessionAffinity } from '@/services/sortEngine';
import type { Offer, ScoredOffer } from '@/types';
import { cn } from '@/hooks/utils';

const hubBrands = ['tops', 'central-department-store', 'robinson', 'power-buy', 'supersports', 'sephora', 'starbucks', 'b2s', 'muji', 'officemate'];

/** Default PLP pool: everything a member can collect or redeem. */
const plpPool = (): Offer[] => catalogue.filter((o) => ['Coupon', 'Phrom Pay Coupon', 'Redeem Points', 'Redeem Cash', 'Card Offer'].includes(o.offerType));

/** Chapter 2 — Search: smart search + category pages with DY sorting. */
export function SearchScreen() {
  const {
    appUserProfile,
    searchQuery,
    setSearchQuery,
    activeChip,
    setActiveChip,
    trackAffinity,
    rankContext,
    sortMode,
    setRanking,
    openWhy,
    askMuse,
    openBrand,
    sessionAffinity,
  } = useDemo();
  const p = appUserProfile;
  const live = topSessionAffinity(sessionAffinity);

  // Chip order: persona default, with the live top affinity pulled to the front for new members.
  const chips = useMemo(() => {
    const base = p.categoryChips.map((id) => chipById(id)!).filter(Boolean);
    if (p.homeVariant !== 'newMember' || !live) return base;
    const hot = Object.entries(chipAffinity).find(([, cat]) => cat === live)?.[0];
    if (!hot) return base;
    return [base.find((c) => c.id === hot)!, ...base.filter((c) => c.id !== hot)].filter(Boolean);
  }, [p, live]);
  const row1 = chips.filter((_, i) => i % 2 === 0);
  const row2 = chips.filter((_, i) => i % 2 === 1);

  const q = searchQuery.trim();
  const gift = isGiftQuery(q);
  const result = useMemo(() => {
    if (q) {
      const { exact, semantic } = searchOffers(q);
      const a = rankOffers(exact, rankContext);
      // Gift queries are intentionally broad: keep the default popularity order and let the assistant narrow it down.
      const b = isGiftQuery(q) ? { ranked: rankOffers(semantic, { ...rankContext, mode: 'today' }).ranked.sort((x, y) => y.offer.redemptions - x.offer.redemptions), excluded: [] as ScoredOffer[] } : rankOffers(semantic, rankContext);
      if (!a.ranked.length && !b.ranked.length) {
        const fallback = rankOffers(popularCoupons(8), { ...rankContext, mode: 'today' });
        return { title: `No exact match for “${q}” · popular right now`, ranked: fallback.ranked, excluded: [] as ScoredOffer[], semanticFrom: -1, semanticCount: 0, fallback: true };
      }
      return { title: `Results for “${q}”`, ranked: [...a.ranked, ...b.ranked], excluded: [...a.excluded, ...b.excluded], semanticFrom: a.ranked.length, semanticCount: b.ranked.length, fallback: false };
    }
    const chip = activeChip ? chipById(activeChip) : undefined;
    // Category chips list coupons/perks like the live app; app deals and challenges have their own shelves.
    const pool = chip ? catalogue.filter((o) => chip.match(o) && (['cyber', 'perks', 'card'].includes(chip.id) || !['Central App Deal', 'Challenge', 'Insurance'].includes(o.offerType))) : plpPool();
    const r = rankOffers(pool, rankContext);
    return { title: chip ? chip.label : 'All coupons', ...r, semanticFrom: -1, semanticCount: 0, fallback: false };
  }, [q, activeChip, rankContext]);

  useEffect(() => {
    setRanking({ title: result.title, ranked: result.ranked, excluded: result.excluded });
    return () => setRanking(null);
  }, [result, setRanking]);

  const onChip = (id: string) => {
    const next = activeChip === id ? null : id;
    setActiveChip(next);
    setSearchQuery('');
    if (next && chipAffinity[next]) trackAffinity(chipAffinity[next], 1);
  };

  const onSearch = (v: string) => {
    setSearchQuery(v);
    if (activeChip) setActiveChip(null);
  };

  const reasonFor = (s: ScoredOffer) => primaryReason(s);
  const hiddenSummary = summarise(result.excluded);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        {/* Search bar */}
        <label className="flex items-center gap-2 rounded-full border border-outline-variant bg-white px-3.5 py-2.5">
          <Icon name="search" className="text-[20px] text-primary" />
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={p.homeVariant === 'newMember' ? 'Now you can search... “กาแฟ”' : 'Now you can search... “Tops”'}
            aria-label="Search offers"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-on-surface-variant"
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearch('')} aria-label="Clear search" className="text-on-surface-variant">
              <Icon name="cancel" filled className="text-[18px]" />
            </button>
          )}
        </label>

        {/* Category chips — two scrolling rows, order personalised */}
        <div className="flex flex-col gap-2">
          {[row1, row2].map((row, i) => (
            <div key={i} className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3">
              {row.map((c) => (
                <Chip key={c.id} label={c.label} icon={c.icon} active={activeChip === c.id} onClick={() => onChip(c.id)} />
              ))}
            </div>
          ))}
        </div>

        {/* Brand hubs */}
        {!q && !activeChip && (
          <div className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 py-1">
            {hubBrands.map((b) => (
              <button key={b} type="button" onClick={() => openBrand(b)} className="flex w-14 shrink-0 flex-col items-center gap-1">
                <BrandTile brandId={b} round size="xs" className="h-12 w-12 ring-1 ring-black/5" />
                <span className="w-full truncate text-center text-[10px] text-on-surface-variant">{brandStyle(b).label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Smart search → assistant hand-off (gifting gets a guided prompt) */}
        {q && (
          <button
            type="button"
            onClick={() => askMuse(q)}
            className={cn('flex items-center gap-3 rounded-2xl border p-3 text-left', gift ? 'border-primary/40 bg-the1-black text-white' : 'border-primary/20 bg-primary-fixed')}
          >
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white', gift ? 'bg-white/15' : 'muse-gradient')}>
              <Icon name={gift ? 'redeem' : 'auto_awesome'} filled className="text-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block text-[13px] font-bold', gift ? 'text-white' : 'text-on-surface')}>{gift ? 'Looking for a gift? Let the assistant find the best deal' : `Ask The 1 assistant about “${q}”`}</span>
              <span className={cn('block text-[11px]', gift ? 'text-white/75' : 'text-on-surface-variant')}>{gift ? 'Tell it who it’s for and your budget — it picks free coupons and perks worth your points' : `Get the best ${q} deal for you, with points you can use`}</span>
            </span>
            <Icon name="chevron_right" className={gift ? 'text-white/80' : 'text-on-surface-variant'} />
          </button>
        )}

        <SortIndicator
          live={sortMode === 'dy' && !!live && !gift && !result.fallback}
          label={result.fallback || gift ? 'Default order · most collected first' : sortMode === 'dy' ? (live ? `Sorted for you · ${live.replace(/^brand:/, '')} first` : 'Sorted for you by Dynamic Yield') : 'The 1 today · newest first'}
          onWhy={openWhy}
        />

        <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
          <span>
            {result.title} · {result.ranked.length}
          </span>
          {sortMode === 'dy' && result.excluded.length > 0 && (
            <button type="button" onClick={openWhy} className="flex items-center gap-1 font-medium">
              <Icon name="visibility_off" className="text-[14px]" />
              {result.excluded.length} hidden · {hiddenSummary}
            </button>
          )}
        </div>

        {q && result.semanticCount > 0 && !gift && (
          <p className="-mt-1 flex items-start gap-1.5 text-[11px] text-on-surface-variant">
            <Icon name="psychology" className="mt-px text-[14px] text-primary" />
            <span>
              Smart search understood “{q}” as {expandQuery(q).filter((t) => t !== q.toLowerCase()).slice(0, 4).join(', ')} · {result.semanticCount} intent match{result.semanticCount === 1 ? '' : 'es'} included
            </span>
          </p>
        )}

        <motion.div key={`${result.title}-${sortMode}-${result.ranked.map((s) => s.offer.id).slice(0, 6).join(',')}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          {result.ranked.map((s, i) => (
            <SearchItem key={s.offer.id} s={s} i={i} reason={sortMode === 'dy' ? reasonFor(s) : undefined} />
          ))}
        </motion.div>

        {result.ranked.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <Icon name="search_off" className="text-[32px] text-on-surface-variant" />
            <p className="mt-2 text-sm font-semibold text-on-surface">No offers match</p>
            <p className="text-[12px] text-on-surface-variant">Try “coffee”, “movie”, “luxury bag” or ask the assistant.</p>
          </div>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>
  );
}

function SearchItem({ s, i, reason }: { s: ScoredOffer; i: number; reason?: string }) {
  const variant = s.offer.offerType === 'Challenge' ? 'challenge' : s.offer.pointsCost > 0 ? 'perk' : 'coupon';
  return <OfferCard offer={s.offer} index={i} variant={variant} reason={reason} className={variant === 'challenge' ? 'col-span-2' : undefined} />;
}

function summarise(excluded: ScoredOffer[]): string {
  const counts = new Map<string, number>();
  excluded.forEach((s) => counts.set(s.excluded!, (counts.get(s.excluded!) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k.toLowerCase())
    .join(', ');
}

export const allCategoryChips = categoryChips;
