import type { AppUserProfile, Offer, RankFactor, ScoredOffer, Tier } from '@/types';
import { daysUntil } from '@/hooks/utils';
import { pointsPerBaht } from '@/mock-data/offers';

/**
 * Mock of the Dynamic Yield sorting optimiser used on The 1 hubs, category
 * pages and brand pages. Mirrors what was scoped with The 1:
 *
 *  1. Personal (targeted) items stay pinned on top.
 *  2. Merchandising rules filter out what the member cannot use right now:
 *     out of stock, not enough points, level requirement, already redeemed,
 *     already in the wallet, expired.
 *  3. The remainder is scored with a weighted blend (Algorithm Studio style):
 *     real-time affinity, user margin (highest value for lowest points / spend),
 *     popularity, urgency (ending soon / running out) and a
 *     gamification boost for members short of points.
 *
 *  "today" mode reproduces the current The 1 behaviour: newest first, no
 *  filtering — so the contrast is visible in the demo.
 */

export type SortMode = 'dy' | 'today';

export interface RankContext {
  profile: AppUserProfile;
  points: number;
  sessionAffinity: Record<string, number>;
  redeemedIds: Set<string>;
  walletIds: Set<string>;
  joinedIds: Set<string>;
  mode: SortMode;
}

const tierRank: Record<Tier, number> = { 'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'The 1 Exclusive': 4 };

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Combined seed + in-session affinity for an offer, 0..1. */
export function affinityFor(o: Offer, ctx: RankContext): { value: number; note?: string } {
  const seed = ctx.profile.affinities;
  const live = ctx.sessionAffinity;
  const keys = [o.category, `brand:${o.brandId}`, ...o.tags.map((t) => `tag:${t}`)];
  let seedScore = 0;
  let liveScore = 0;
  let hit: string | undefined;
  for (const k of keys) {
    if ((seed[k] ?? 0) > seedScore) {
      seedScore = seed[k];
      hit = hit ?? k;
    }
    const l = live[k] ?? 0;
    if (l > liveScore) {
      liveScore = l;
      hit = k;
    }
  }
  // Live signals count 1 per interaction; three interactions saturate.
  const value = clamp(seedScore * 0.7 + clamp(liveScore / 3) * 0.9);
  const label = hit?.startsWith('brand:') ? o.brand : hit?.replace(/^tag:/, '');
  return { value, note: value > 0.2 && label ? `Affinity: ${label}` : undefined };
}

/** User margin — value for the member per point or per baht of required spend. */
export function marginFor(o: Offer): { value: number; note?: string } {
  if (o.offerType === 'Challenge') {
    if (o.multiplier) return { value: 0.75, note: `x${o.multiplier} points` };
    if (o.rewardPoints && o.minSpendThb) {
      const r = o.rewardPoints / o.minSpendThb; // points earned per ฿1
      return { value: clamp(r * 8), note: `${Math.round(r * 100)} pts per ฿100` };
    }
    if (o.rewardPoints) return { value: 0.6, note: `${o.rewardPoints} pts` };
    return { value: 0.4 };
  }
  if (o.pointsCost > 0) {
    const ppb = pointsPerBaht(o);
    if (ppb == null) return { value: 0.3 };
    return { value: clamp((10 - ppb) / 6), note: `${ppb} pts per ฿1${ppb < 8 ? ' · beats 8:1 cash' : ''}` };
  }
  if (o.discountThb && o.minSpendThb) {
    const r = o.discountThb / o.minSpendThb;
    return { value: clamp((r - 0.04) / 0.12), note: `${Math.round(r * 100)}% off min. spend` };
  }
  if (o.multiplier) return { value: 0.6, note: `x${o.multiplier} points` };
  return { value: 0.35 };
}

function urgencyFor(o: Offer): { value: number; note?: string } {
  const d = daysUntil(o.validUntil);
  if (o.stockLevel === 'low') return { value: 1, note: 'Running out' };
  if (d <= 2) return { value: 1, note: `Ends in ${d} day${d === 1 ? '' : 's'}` };
  if (d <= 7) return { value: 0.6, note: `Ends in ${d} days` };
  return { value: 0 };
}

/** Merchandising rule that removes the offer, if any. */
export function exclusionFor(o: Offer, ctx: RankContext): string | undefined {
  if (!o.inStock) return 'Out of stock';
  if (daysUntil(o.validUntil) < 0) return 'Expired';
  if (ctx.redeemedIds.has(o.id)) return 'Already redeemed';
  if (ctx.walletIds.has(o.id)) return 'Already in your wallet';
  if (ctx.joinedIds.has(o.id)) return 'Already joined';
  if (o.pointsCost > ctx.points) return 'Not enough points';
  if (o.memberLevel.startsWith('Level')) {
    const need = Number(o.memberLevel.replace('Level ', ''));
    if (tierRank[ctx.profile.tier] < need) return `Requires ${o.memberLevel}`;
  }
  if (o.memberLevel === 'The 1 Family' && !ctx.profile.affinities.Kids) return 'The 1 Family members only';
  if (o.offerType === 'Card Offer' && ctx.profile.hasRedzCard) return 'Already a cardholder';
  return undefined;
}

export function scoreOffer(o: Offer, ctx: RankContext, maxPop: number): ScoredOffer {
  const excluded = exclusionFor(o, ctx);
  const aff = affinityFor(o, ctx);
  const margin = marginFor(o);
  const urg = urgencyFor(o);
  const pop = clamp(Math.log10(1 + o.redemptions) / Math.log10(1 + maxPop));
  const shortOfPoints = ctx.points < 1000;
  const recentlyBought = ctx.profile.recentPurchases.includes(o.category) && o.offerType !== 'Challenge';

  const factors: RankFactor[] = [
    { key: 'affinity', label: 'Affinity', value: recentlyBought ? 0.05 : aff.value, weight: 0.4, note: recentlyBought ? 'Bought recently — cadence suppression' : aff.note },
    { key: 'margin', label: 'User margin', value: margin.value, weight: 0.25, note: margin.note },
    { key: 'popularity', label: 'Popularity', value: pop, weight: 0.1, note: `${o.redemptions.toLocaleString('en-US')} redeemed · 30d` },
    { key: 'urgency', label: 'Urgency', value: urg.value, weight: 0.1, note: urg.note },
    {
      key: 'gamification',
      label: 'Earn boost',
      value: o.offerType === 'Challenge' ? 1 : 0,
      weight: shortOfPoints ? 0.15 : 0,
      note: o.offerType === 'Challenge' && shortOfPoints ? 'Low balance — promote ways to earn' : undefined,
    },
  ];
  const totalW = factors.reduce((t, f) => t + f.weight, 0);
  const score = Math.round((factors.reduce((t, f) => t + f.value * f.weight, 0) / totalW) * 100);
  return { offer: o, score, factors, excluded };
}

/**
 * Light diversification: within the first `window` slots a brand appears once
 * before any brand repeats, so a shelf doesn't open with three Starbucks cards.
 * Pinned items are left untouched.
 */
function diversify(list: ScoredOffer[], pinned: Set<string>, window = 6): ScoredOffer[] {
  const head = list.filter((s) => pinned.has(s.offer.id));
  const rest = list.filter((s) => !pinned.has(s.offer.id));
  const out: ScoredOffer[] = [];
  const deferred: ScoredOffer[] = [];
  const seen = new Set<string>();
  for (const s of rest) {
    if (out.length < window && seen.has(s.offer.brandId)) deferred.push(s);
    else {
      out.push(s);
      seen.add(s.offer.brandId);
    }
  }
  return [...head, ...out, ...deferred];
}

/**
 * Rank a list of offers for the member. Pinned (personal) items are kept on
 * top in DY mode; "today" mode is the live app's newest-first order.
 */
export function rankOffers(list: Offer[], ctx: RankContext, opts: { diversify?: boolean } = {}): { ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  if (ctx.mode === 'today') {
    const ranked = list
      .slice()
      .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || b.id.localeCompare(a.id))
      .map((offer) => ({ offer, score: 0, factors: [] as RankFactor[] }));
    return { ranked, excluded: [] };
  }
  const maxPop = Math.max(1, ...list.map((o) => o.redemptions));
  const scored = list.map((o) => scoreOffer(o, ctx, maxPop));
  const pinned = new Set(ctx.profile.pinned);
  const sorted = scored
    .filter((s) => !s.excluded)
    .sort((a, b) => {
      const pa = pinned.has(a.offer.id) ? 0 : 1;
      const pb = pinned.has(b.offer.id) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.score - a.score || b.offer.redemptions - a.offer.redemptions;
    })
    .map((s) => (pinned.has(s.offer.id) ? { ...s, factors: [{ key: 'pinned', label: 'Personal item', value: 1, weight: 1, note: 'Targeted offer — always on top' } as RankFactor, ...s.factors] } : s));
  const ranked = opts.diversify === false ? sorted : diversify(sorted, pinned);
  const excluded = scored.filter((s) => s.excluded);
  return { ranked, excluded };
}

/** Convenience: ranked offers only. */
export const rankedOffers = (list: Offer[], ctx: RankContext): Offer[] => rankOffers(list, ctx).ranked.map((s) => s.offer);

/** Display priority for factor notes: the most situational signal wins. */
export const factorPriority: RankFactor['key'][] = ['pinned', 'urgency', 'gamification', 'affinity', 'margin', 'popularity'];

/** The single most relevant reason to show on a card. */
export function primaryReason(s: ScoredOffer, allow: RankFactor['key'][] = ['pinned', 'urgency', 'gamification', 'affinity']): string | undefined {
  for (const key of factorPriority) {
    if (!allow.includes(key)) continue;
    const f = s.factors.find((x) => x.key === key && x.note && x.weight > 0 && x.value > 0);
    if (f) return f.note;
  }
  return undefined;
}

/** Top live affinity label for copy ("Picked for your beauty interest"). */
export function topSessionAffinity(session: Record<string, number>): string | null {
  const entries = Object.entries(session).filter(([k]) => !k.startsWith('tag:'));
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0].replace(/^brand:/, '');
}
