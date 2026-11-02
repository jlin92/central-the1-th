import type { Banner, Offer, ScoredOffer } from '@/types';
import { catalogue, offer } from '@/mock-data/offers';
import { chapterIdByKey } from '@/app/chapters';
import { rankOffers, scoreOffer, type RankContext } from './sortEngine';

/** Rank a subset of the catalogue and return the top N offers. */
function top(list: Offer[], ctx: RankContext, n: number): Offer[] {
  return rankOffers(list, ctx).ranked.slice(0, n).map((s) => s.offer);
}

const byType = (...types: Offer['offerType'][]) => catalogue.filter((o) => types.includes(o.offerType));

/** "Only for You" — free coupons the member can use today, ranked by DY. */
export function onlyForYou(ctx: RankContext, n = 8): ScoredOffer[] {
  return rankOffers(byType('Coupon'), ctx).ranked.slice(0, n);
}

/** Full Only-for-You ranking incl. what the rules filtered out (for the reasoning rail). */
export function onlyForYouFull(ctx: RankContext): { ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  return rankOffers(byType('Coupon'), ctx);
}

/** Challenges to promote (unjoined); pinned personal missions first. */
export function challengesForHome(ctx: RankContext, n = 6): Offer[] {
  return top(byType('Challenge'), ctx, n);
}

/** All challenges for the Challenge tab: joined first (with progress), then ranked. */
export function challengesForTab(ctx: RankContext, joined: Record<string, number>): { joined: Offer[]; ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  const all = byType('Challenge');
  const joinedList = Object.keys(joined)
    .map((id) => all.find((o) => o.id === id))
    .filter((o): o is Offer => !!o);
  const { ranked, excluded } = rankOffers(all, ctx);
  return { joined: joinedList, ranked, excluded: excluded.filter((s) => s.excluded !== 'Already joined') };
}

/**
 * Points-only perks. If nothing is affordable (new member), fall back to the
 * closest-to-reach perks so the shelf still inspires rather than hides.
 */
export function perksForHome(ctx: RankContext, n = 8): Offer[] {
  const perks = byType('Redeem Points');
  const ranked = top(perks, ctx, n);
  if (ranked.length) return ranked;
  return perks
    .slice()
    .sort((a, b) => a.pointsCost - b.pointsCost || b.redemptions - a.redemptions)
    .slice(0, n);
}

export const dealsForHome = (ctx: RankContext, n = 8): Offer[] => top(byType('Central App Deal'), ctx, n);
export const insuranceForHome = (ctx: RankContext, n = 6): Offer[] => top(byType('Insurance'), ctx, n);
export const phromPayForHome = (ctx: RankContext, n = 8): Offer[] => top(byType('Phrom Pay Coupon'), ctx, n);

/**
 * "Best value for your points" — custom algorithm: cash coupons and perks
 * within balance, ordered by user margin (fewest points per ฿1 of value).
 */
export function bestValue(ctx: RankContext, n = 8): ScoredOffer[] {
  const list = byType('Redeem Cash', 'Redeem Points');
  const maxPop = Math.max(1, ...list.map((o) => o.redemptions));
  return list
    .map((o) => scoreOffer(o, ctx, maxPop))
    .filter((s) => !s.excluded)
    .sort((a, b) => {
      const v = (s: ScoredOffer) => s.factors.find((f) => f.key === 'margin')!.value * 0.75 + s.factors.find((f) => f.key === 'affinity')!.value * 0.25;
      return v(b) - v(a) || b.score - a.score;
    })
    .slice(0, n);
}

/** Cash coupons + perks for the Redeem Cash screen, ranked (affordable) and the rest. */
export function redeemOptions(ctx: RankContext): { ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  return rankOffers(byType('Redeem Cash', 'Redeem Points'), ctx);
}

/** Offers that complement the one being viewed (same brand or category, not itself). */
export function relatedOffers(o: Offer, ctx: RankContext, n = 3): Offer[] {
  const pool = catalogue.filter((x) => x.id !== o.id && (x.brandId === o.brandId || x.category === o.category) && x.offerType !== 'Challenge');
  return top(pool, ctx, n);
}

/** A challenge that helps earn toward a perk the member can't yet afford. */
export function challengeToAfford(o: Offer, ctx: RankContext): Offer | null {
  const gap = o.pointsCost - ctx.points;
  if (gap <= 0) return null;
  const all = byType('Challenge').filter((c) => c.rewardPoints);
  const covering = all.filter((c) => (c.rewardPoints ?? 0) >= gap);
  // Prefer the smallest mission that still covers the gap; otherwise the biggest earner.
  const candidates = covering.length ? covering.sort((a, b) => (a.minSpendThb ?? 0) - (b.minSpendThb ?? 0)).slice(0, 4) : all.sort((a, b) => (b.rewardPoints ?? 0) - (a.rewardPoints ?? 0)).slice(0, 3);
  const ranked = top(candidates, ctx, 1);
  return ranked[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Generative banner — a live variant written from the top in-session   */
/* affinity for a member with no history.                              */
/* ------------------------------------------------------------------ */

const liveBannerCopy: Record<string, Omit<Banner, 'id' | 'note' | 'chapter' | 'tone' | 'icon'> & { chip: string; icon: string }> = {
  Beauty: { eyebrow: 'Picked for you', title: 'Beauty lovers start here', body: 'Sephora, Boots and Eveandboy coupons — free to collect, no points needed.', cta: 'See beauty coupons', chip: 'beauty', icon: 'spa' },
  'Food & Beverage': { eyebrow: 'Picked for you', title: 'Coffee first?', body: 'Starbucks ฿30 off and Café Amazon ฿10 off are free to collect. Show your QR and start earning.', cta: 'See food & drink coupons', chip: 'fnb', icon: 'coffee' },
  Grocery: { eyebrow: 'Picked for you', title: 'Save on this week’s groceries', body: 'Tops ฿20 off is free to collect — and every basket earns points.', cta: 'See grocery coupons', chip: 'grocery', icon: 'shopping_basket' },
  Fashion: { eyebrow: 'Picked for you', title: 'Refresh your wardrobe for less', body: 'Central, Robinson and Uniqlo coupons — collect now, use at checkout.', cta: 'See fashion coupons', chip: 'fashion', icon: 'checkroom' },
  Entertainment: { eyebrow: 'Picked for you', title: 'Movie night, sorted', body: 'Major Cineplex and SF Cinema coupons are free to collect today.', cta: 'See entertainment coupons', chip: 'entertainment', icon: 'theaters' },
  Kids: { eyebrow: 'Picked for you', title: 'Something for the kids', body: 'Central Kids, Mothercare and B2S coupons — free to collect.', cta: 'See kids coupons', chip: 'kids', icon: 'child_care' },
  Electronics: { eyebrow: 'Picked for you', title: 'Upgrade your tech for less', body: 'Power Buy ฿100 off is free to collect. Big baskets earn big points.', cta: 'See electronics coupons', chip: 'electronics', icon: 'devices' },
  Sports: { eyebrow: 'Picked for you', title: 'Gear up and save', body: 'SuperSports ฿100 off is free to collect — plus a ฿1,000 coupon challenge.', cta: 'See sports coupons', chip: 'sports', icon: 'fitness_center' },
  Home: { eyebrow: 'Picked for you', title: 'Make home feel new', body: 'Muji, Thai Watsadu and BnB home coupons — free to collect.', cta: 'See home coupons', chip: 'home', icon: 'chair' },
};

export function liveBanner(topAffinity: string): (Banner & { chip: string }) | null {
  const key = topAffinity.startsWith('brand:') ? offerCategoryForBrand(topAffinity.slice(6)) : topAffinity;
  const c = key ? liveBannerCopy[key] : undefined;
  if (!c || !key) return null;
  return {
    id: `live-${key}`,
    eyebrow: c.eyebrow,
    title: c.title,
    body: c.body,
    cta: c.cta,
    chapter: chapterIdByKey('search'),
    tone: 'dark',
    icon: c.icon,
    chip: c.chip,
    note: `Generated live from this session’s ${key.toLowerCase()} signal — copy, CTA and destination chosen by DY in real time.`,
  };
}

function offerCategoryForBrand(brandId: string): string | undefined {
  return catalogue.find((o) => o.brandId === brandId && o.offerType === 'Coupon')?.category;
}

export const offerById = offer;
