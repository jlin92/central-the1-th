import type { AppUserId, MusePrompt, MuseReply, Offer, ProactiveNudge, Tier } from '@/types';
import { catalogue, expandQuery, pointsPerBaht } from '@/mock-data/offers';
import { daysUntil, formatPoints, formatThb, shortDate } from '@/hooks/utils';

/** Live member state the dynamic resolvers need. */
export interface MuseContext {
  points: number;
  tier: Tier;
  walletIds: Set<string>;
  redeemedIds: Set<string>;
  joinedIds: Set<string>;
  /** THB progress on joined challenges. */
  joined: Record<string, number>;
  hasRedzCard: boolean;
  affinities: Record<string, number>;
}

const tierRank: Record<Tier, number> = { 'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'The 1 Exclusive': 4 };

/* ================================================================== */
/* PERSONA 1 — Ploy · NEW MEMBER (education + free value + earn)       */
/* ================================================================== */

const ployScripts: Record<string, MuseReply> = {
  'how-it-works': {
    kind: 'support',
    text: 'Welcome to The 1, Ploy! Here’s the whole programme in three lines:',
    bullets: [
      'Earn 1 point for every ฿25 you spend at Central, Robinson, Tops, Power Buy, SuperSports and 1,000+ partners — just show your QR.',
      'Coupons are free to collect. Tap Get, then show your QR at checkout — the discount applies and you still earn points.',
      'Points work like cash: 8 points = ฿1 on universal cash coupons, and many partner perks give you even more per point.',
    ],
    chips: ['New member', 'Programme basics'],
    followups: ['Show me free coupons', 'How do I earn points fast?', 'What can points get me?'],
  },
  'free-coupons': {
    kind: 'commerce',
    text: 'These are the most-collected free coupons this week — no points needed, and every one earns points when you use it.',
    chips: ['Free to collect', 'Popular with new members'],
    results: ['200001', '200042', '200179'],
    reasons: ['Most collected coupon this month', 'Weekly groceries, ฿300 min. spend', 'Coffee today, 10% off'],
    followups: ['Find me a coffee deal', 'Something for beauty', 'How do I earn points fast?'],
  },
  earn: {
    kind: 'support',
    text: 'The fastest way is a challenge: join for free, shop as normal, and bonus points land on top of what you earn anyway.',
    bullets: [
      'Central App challenge: shop ฿10,000 → 1,111 bonus points.',
      'Starbucks challenge: buy 3 drinks this month → 100 bonus points.',
      'First Coupon challenge: use any coupon → 50 bonus points.',
    ],
    chips: ['Earn boost', 'Gamification'],
    action: { label: 'See challenges', chapter: 6 },
    followups: ['Show me free coupons', 'What can points get me?'],
  },
  coffee: {
    kind: 'commerce',
    text: 'Coffee it is. Here are the best coffee deals you can collect right now — Starbucks ฿100 off is running out, so I’ve put it near the top.',
    chips: ['Intent: coffee', 'Smart search', 'Free to collect'],
    results: ['200179', '300017', '300013', '300032'],
    reasons: ['10% off a ฿300 spend — best ratio in coffee', 'Running out · ฿600 min. spend', 'Cheapest cup: ฿10 off ฿60', 'Earn 100 points while you sip'],
    followups: ['Which one is the best value?', 'Show me dessert deals', 'How do I earn points fast?'],
  },
  'coffee-value': {
    kind: 'support',
    text: 'For a single coffee, Starbucks ฿30 off a ฿300 spend is the best ratio (10%). If you’re buying for friends, the ฿100 off ฿600 coupon saves more in baht — but it’s running out today.',
    chips: ['User margin', 'Best value'],
    followups: ['Get the Starbucks ฿30 coupon', 'Show me free coupons'],
  },
  dessert: {
    kind: 'commerce',
    text: 'Sweet tooth covered — all free to collect:',
    chips: ['Intent: dessert', 'Free to collect'],
    results: ['300027', '200187', '300014'],
    reasons: ['Ends tomorrow', '10% off donuts', 'Coffee + bakery'],
    followups: ['Find me a coffee deal', 'Show me movie deals'],
  },
  beauty: {
    kind: 'commerce',
    text: 'Beauty coupons new members love — free to collect, and the Sephora challenge turns your first haul into 300 bonus points.',
    chips: ['Intent: beauty', 'Free to collect', 'Earn boost'],
    results: ['200188', '200190', '200192', '300031'],
    reasons: ['Most collected beauty coupon', 'Skincare and pharmacy', 'Trending with members under 30', 'Shop ฿3,000 → 300 points'],
    followups: ['Show me fashion deals', 'How do I earn points fast?'],
  },
  fashion: {
    kind: 'commerce',
    text: 'Fashion coupons you can use today at Central, Robinson and Uniqlo:',
    chips: ['Intent: fashion', 'Free to collect'],
    results: ['200001', '200006', '200194'],
    reasons: ['Any Central Department Store', 'Any Robinson', '฿100 off ฿1,000'],
    followups: ['Something for beauty', 'Show me free coupons'],
  },
  movie: {
    kind: 'commerce',
    text: 'Movie night: these are free to collect. Once you have 1,290 points you can also redeem a free 2D ticket at Major Cineplex.',
    chips: ['Intent: movie', 'Free to collect'],
    results: ['300028', '300029', '200119'],
    reasons: ['฿60 off any 2D ticket', '฿50 off any 2D ticket', 'Free ticket once you reach 1,290 points'],
    followups: ['How do I earn points fast?', 'Show me dessert deals'],
  },
  luxury: {
    kind: 'commerce',
    text: 'For a designer bag, Central Chidlom Luxury Hall gives the biggest saving; Coach and Charles & Keith are lighter on the minimum spend.',
    chips: ['Intent: luxury bag', 'Smart search'],
    results: ['300020', '300021', '300022'],
    reasons: ['฿2,000 off ฿20,000', '฿1,500 off ฿12,000', '฿200 off ฿1,500'],
    followups: ['Show me fashion deals', 'What can points get me?'],
  },
  'points-value': {
    kind: 'support',
    text: 'Points are worth real money. 8 points = ฿1 on universal cash coupons at any Central Group store — and partner perks often beat that:',
    bullets: [
      'Starbucks free tall drink: 800 points for ≈฿145 (5.5 points per ฿1).',
      'KFC 2-piece chicken: 560 points for ≈฿89 (6.3 points per ฿1).',
      'Major Cineplex 2D ticket: 1,290 points for ≈฿240 (5.4 points per ฿1).',
    ],
    chips: ['8 points = ฿1', 'Best value'],
    action: { label: 'See Redeem Cash', chapter: 7 },
    followups: ['How do I earn points fast?', 'Show me free coupons'],
  },
  'deal-check': {
    kind: 'support',
    text: 'Yes — it’s one of the better ratios in its category, it’s free to collect, and using it still earns you points on the receipt. The only thing to check is the minimum spend.',
    chips: ['User margin', 'Eligibility ✓'],
    followups: ['Show me free coupons', 'How do I earn points fast?'],
  },
};

const ployRules: { match: RegExp; key: string }[] = [
  { match: /(good deal|worth it|should i)/i, key: 'deal-check' },
  { match: /(best value|which one|cheapest|better)/i, key: 'coffee-value' },
  { match: /(coffee|cafe|café|กาแฟ|latte|americano|starbucks)/i, key: 'coffee' },
  { match: /(dessert|sweet|donut|ice cream|cake|toast)/i, key: 'dessert' },
  { match: /(beauty|makeup|skincare|sephora|cosmetic|เครื่องสำอาง)/i, key: 'beauty' },
  { match: /(luxury|designer|bag|handbag|กระเป๋า)/i, key: 'luxury' },
  { match: /(fashion|clothes|outfit|wardrobe|uniqlo)/i, key: 'fashion' },
  { match: /(movie|cinema|film|หนัง)/i, key: 'movie' },
  { match: /(how.*(work|start)|what is the 1|new|explain)/i, key: 'how-it-works' },
  { match: /(earn|fast|challenge|bonus|more points)/i, key: 'earn' },
  { match: /(worth|value|what can points|8 points|baht|cash)/i, key: 'points-value' },
  { match: /(free coupons|show me free|coupon|\bget\b)/i, key: 'free-coupons' },
];

/* ================================================================== */
/* PERSONA 2 — Nat · RETURNING LEVEL 3 (value + expiry + weekly shop)   */
/* ================================================================== */

const natScripts: Record<string, MuseReply> = {
  expiring: {
    kind: 'commerce',
    text: 'You have 3,200 points expiring on 31 Dec and 24,850 in total. Best value per point first — these partner perks beat the 8:1 cash rate:',
    chips: ['3,200 pts expiring', 'User margin', 'Within your balance'],
    results: ['200118', '200119', '200057', '300035'],
    reasons: ['5.5 pts per ฿1 · your coffee brand', '5.4 pts per ฿1 · family movie night', '฿100 off your weekly Tops shop', 'Smallest conversion — uses 400 pts'],
    followups: ['What can I use at Tops this week?', 'Something for the kids this weekend', 'How do I reach The 1 Exclusive?'],
  },
  tops: {
    kind: 'commerce',
    text: 'For your weekly Tops shop, these are the in-store coupons worth collecting. I’ve skipped Tops Online coupons — you shop in store — and the ฿20 one already in your wallet.',
    chips: ['Weekly Tops shopper', 'In-store only', 'Wallet-aware'],
    results: ['300006', '300007', '300005', '200077'],
    reasons: ['Best ratio for a ฿800+ basket', 'For a big monthly shop', 'Quick top-up shop', 'Pay with The 1 Phrom Pay'],
    action: { label: 'Open Tops hub', chapter: 3, brandId: 'tops' },
    followups: ['How far is my Tops challenge?', 'Use my expiring points', 'Find me a coffee deal'],
  },
  'tops-challenge': {
    kind: 'support',
    text: 'You’re at ฿3,850 of ฿5,000 on the Tops “Get 500 Points” challenge — ฿1,150 to go. This week’s shop should finish it.',
    bullets: ['Finish by 15 Dec to receive the 500 bonus points.', 'Stack the ฿60 off coupon on the same basket — it still counts toward the challenge.', 'Your targeted Weekly Shopper mission (300 points) is waiting to be joined too.'],
    chips: ['Challenge progress', 'Stackable'],
    action: { label: 'See my challenges', chapter: 6 },
    followups: ['What can I use at Tops this week?', 'Use my expiring points'],
  },
  kids: {
    kind: 'commerce',
    text: 'Weekend with the kids, sorted — all within your points or free to collect:',
    chips: ['The 1 Family', 'Within your balance'],
    results: ['200143', '200144', '200142', '300024'],
    reasons: ['30% off admission · 1,600 pts', '฿400 off · 3,200 pts (your expiring points)', '฿300 off day pass', 'Free coupon · Central Kids'],
    followups: ['Use my expiring points', 'Plan a movie night', 'Beauty deals for me'],
  },
  beauty: {
    kind: 'commerce',
    text: 'Based on your Sephora visits, these beauty deals are the strongest right now:',
    chips: ['Affinity: beauty', 'Sephora regular'],
    results: ['200189', '200188', '300018', '200153'],
    reasons: ['฿200 off ฿2,000 · best Sephora ratio', 'Smaller basket option', 'Central Beauty Galerie', 'Central App · on-top ฿300'],
    followups: ['Something for the kids this weekend', 'Use my expiring points'],
  },
  coffee: {
    kind: 'commerce',
    text: 'Coffee: your free Starbucks tall drink is the best use of 800 points (5.5 per ฿1). I’ve left out the Starbucks ฿50 Off coupon you redeemed two weeks ago.',
    chips: ['Intent: coffee', 'Redeemed-aware', 'User margin'],
    results: ['200118', '300034', '200179', '200135'],
    reasons: ['800 pts · beats cash by 31%', '520 pts · Segafredo', 'Free coupon · 10% off', '450 pts · Café Amazon'],
    followups: ['Use my expiring points', 'What can I use at Tops this week?'],
  },
  movie: {
    kind: 'commerce',
    text: 'Movie night for the family: a free 2D ticket for 1,290 points, popcorn for 650, and MK ฿50 off for dinner before.',
    chips: ['Intent: movie', 'Family'],
    results: ['200119', '200121', '300028', '200183'],
    reasons: ['5.4 pts per ฿1', 'Popcorn combo', '฿60 off a second ticket', 'Dinner first'],
    followups: ['Something for the kids this weekend', 'Use my expiring points'],
  },
  level: {
    kind: 'support',
    text: 'You’re Level 3 with ฿138,400 spend this year. The 1 Exclusive needs ฿300,000 — but your current benefits are already working for you:',
    bullets: ['Free 3-hour parking at Central and Robinson.', 'Lounge access at CentralWorld, Chidlom and Ladprao.', 'Early access to Midnight Sale and Cyber Deals.', 'Central The 1 REDZ earns x3 points at Central Group stores.'],
    chips: ['Level 3', 'Member benefits'],
    action: { label: 'See all benefits', chapter: 8 },
    followups: ['Use my expiring points', 'What can I use at Tops this week?'],
  },
  card: {
    kind: 'support',
    text: 'You already hold a Central The 1 REDZ card, so I’ve hidden the “Apply Card” offers. Your card earned x3 points on last week’s Tops shop (223 points).',
    chips: ['Cardholder', 'Suppression'],
    followups: ['Use my expiring points', 'How do I reach The 1 Exclusive?'],
  },
  'deal-check': {
    kind: 'support',
    text: 'For you, yes — it fits your usual spend, you haven’t redeemed it before, and it stacks with the points you earn on the receipt. For your Tops shop this week, use the ฿60 off first; it’s the better ratio for your basket size.',
    chips: ['User margin', 'Eligibility ✓'],
    followups: ['What can I use at Tops this week?', 'Use my expiring points'],
  },
};

const natRules: { match: RegExp; key: string }[] = [
  { match: /(good deal|worth it|should i)/i, key: 'deal-check' },
  { match: /(challenge|progress|how far|mission)/i, key: 'tops-challenge' },
  { match: /(tops|grocer|weekly|shop this week|supermarket)/i, key: 'tops' },
  { match: /(movie|cinema|film|หนัง|date night)/i, key: 'movie' },
  { match: /(kid|child|family|weekend|son|daughter)/i, key: 'kids' },
  { match: /(beauty|sephora|makeup|skincare|เครื่องสำอาง)/i, key: 'beauty' },
  { match: /(coffee|cafe|café|กาแฟ|starbucks)/i, key: 'coffee' },
  { match: /(level|exclusive|benefit|lounge|parking)/i, key: 'level' },
  { match: /(card|redz|credit)/i, key: 'card' },
  { match: /(expiring points|my points|use my|redeem|cash|value|lose)/i, key: 'expiring' },
];

/* ================================================================== */
/* SHARED — prompts every member can ask (from The 1's prompt list)    */
/* Static where the answer is editorial; dynamic where the feed decides */
/* ================================================================== */

const commonScripts: Record<string, MuseReply> = {
  'pet': {
    kind: 'commerce',
    text: 'For your dog: Pet ’N Me coupons are free to collect, and the Pet ’N Me challenge turns the next big bag of food into bonus points.',
    chips: ['Category: Pet', 'Free to collect'],
    results: ['200014', '200015', '200016', '200101'],
    reasons: ['฿50 off ฿500 · 10%', '฿100 off ฿1,000', 'Bulk buy · ฿150 off ฿1,500', 'Shop ฿2,000 → 200 points'],
    followups: ['Which coupons expire soon?', 'How can I earn bonus points this month?'],
  },
  'insurance': {
    kind: 'commerce',
    text: 'Travelling next month? The 1 Insure has travel cover deals — and if you have the points, a hotel perk for the trip itself:',
    chips: ['Brand: The 1 Insure', 'Travel'],
    results: ['200171', '200174', '200172', '200141'],
    reasons: ['฿300 off at ELEMENTS', 'Annual plan · ฿500 off', 'Earn x3 points on the premium', 'Centara Hua Hin · 1 night with points'],
    followups: ['Any free movie or food perks?', 'Help me find a gift'],
  },
  gift: {
    kind: 'support',
    text: 'Happy to help you find a gift. Tell me who it’s for and I’ll pick the best-value deals — free coupons first, then perks you can redeem with points.',
    chips: ['Intent: gifting', 'Guided discovery'],
    followups: ['For my partner', 'For a friend', 'For my mum', 'For the kids', 'A gift under 1,000 points'],
  },
  'gift-partner': {
    kind: 'commerce',
    text: 'For your partner — jewellery and a treat, with the Pandora coupon free to collect:',
    chips: ['Gift · partner', 'Best value first'],
    results: ['300023', '200151', '200139', '200133', '300022', '300021'],
    reasons: ['Free coupon · ฿300 off ฿2,500', 'Central App · on-top ฿500', '30-min massage · 1,000 pts', 'Shibuya toast date · 1,700 pts', 'Free coupon · Charles & Keith ฿200 off', 'Free coupon · Coach ฿1,500 off'],
    followups: ['For a friend', 'A gift under 1,000 points', 'Which coupons expire soon?'],
  },
  'gift-friend': {
    kind: 'commerce',
    text: 'For a friend — small, thoughtful and good value:',
    chips: ['Gift · friend', 'Best value first'],
    results: ['200118', '300022', '200124', '300014', '200187', '300015'],
    reasons: ['Free tall drink · 800 pts', 'Free coupon · Charles & Keith ฿200 off', '6 donuts · 1,000 pts', 'Free coupon · Brown Cafe', 'Free coupon · Mister Donut ฿20 off', 'Free coupon · Segafredo ฿25 off'],
    followups: ['For my partner', 'For my mum', 'A gift under 1,000 points'],
  },
  'gift-mum': {
    kind: 'commerce',
    text: 'For your mum — beauty and a little pampering:',
    chips: ['Gift · mum', 'Best value first'],
    results: ['300018', '200153', '200139', '200138', '200189', '200048'],
    reasons: ['Free coupon · Beauty Galerie ฿300 off', 'Central App · Estée Lauder ฿300', 'Cenvaree massage · 1,000 pts', 'Seafood buffet for two · 10,990 pts', 'Free coupon · Sephora ฿200 off', 'Free coupon · matsukiyo ฿100 off'],
    followups: ['For my partner', 'For the kids', 'Show me beauty deals'],
  },
  'gift-kids': {
    kind: 'commerce',
    text: 'For the kids — a day out or something to unwrap:',
    chips: ['Gift · kids', 'Best value first'],
    results: ['300024', '200034', '200143', '200144', '300025', '200199'],
    reasons: ['Free coupon · Central Kids ฿200 off', 'Free coupon · B2S ฿30 off', 'SEA LIFE 30% off · 1,600 pts', 'KidZania ฿400 off · 3,200 pts', 'Free coupon · Mothercare ฿300 off', 'Free coupon · Crocs ฿150 off'],
    followups: ['For my partner', 'A gift under 1,000 points'],
  },
  'gift-budget': {
    kind: 'commerce',
    text: 'Gifts under 1,000 points — each one beats the 8:1 cash rate:',
    chips: ['Gift · under 1,000 pts', 'User margin'],
    results: ['200118', '200132', '200134', '200136'],
    reasons: ['800 pts · 5.5 per ฿1', '900 pts · 6.4 per ฿1', '800 pts · 6.7 per ฿1', '650 pts · coffee + bakery'],
    followups: ['For my partner', 'For a friend', 'How can I earn bonus points this month?'],
  },
};

/**
 * Shared scripts list more picks than we show; drop what this member can't
 * redeem yet, then trim to four — so a 0-point member sees free coupons, not
 * perks she can't afford.
 */
function adaptToBalance(reply: MuseReply, ctx: MuseContext): MuseReply {
  if (!reply.results) return reply;
  const keep = reply.results.map((id, i) => ({ id, i })).filter(({ id }) => (catalogue.find((o) => o.id === id)?.pointsCost ?? 0) <= ctx.points);
  const chosen = (keep.length >= 2 ? keep : reply.results.map((id, i) => ({ id, i }))).slice(0, 4);
  return { ...reply, results: chosen.map((c) => c.id), reasons: reply.reasons ? chosen.map((c) => reply.reasons![c.i]) : undefined, chips: keep.length < reply.results.length && ctx.points < 1000 ? [...(reply.chips ?? []), 'Free to collect'] : reply.chips };
}

const commonRules: { match: RegExp; key: string }[] = [
  { match: /(for my partner|for my (wife|husband|boyfriend|girlfriend))/i, key: 'gift-partner' },
  { match: /for (a|my) friend/i, key: 'gift-friend' },
  { match: /for my (mum|mom|mother)/i, key: 'gift-mum' },
  { match: /for (the|my) kids?/i, key: 'gift-kids' },
  { match: /(gift|present).*(under|below|budget|points)/i, key: 'gift-budget' },
  { match: /(gift|present|birthday|anniversary|ของขวัญ)/i, key: 'gift' },
  { match: /(dog|cat|puppy|pet)/i, key: 'pet' },
  { match: /(insurance|travel(l)?ing|trip|flight|cover)/i, key: 'insurance' },
];

/** Catalogue brands, longest name first so "Tops Online" wins over "Tops". */
const brandNames = [...new Set(catalogue.map((o) => o.brand))].sort((a, b) => b.length - a.length);
const brandIn = (text: string) => brandNames.find((b) => text.toLowerCase().includes(b.toLowerCase()));

const usable = (o: Offer, ctx: MuseContext) =>
  o.inStock &&
  daysUntil(o.validUntil) >= 0 &&
  !ctx.walletIds.has(o.id) &&
  !ctx.redeemedIds.has(o.id) &&
  (!o.memberLevel.startsWith('Level') || tierRank[ctx.tier] >= Number(o.memberLevel.replace('Level ', '')));
const value = (o: Offer) => (o.discountThb && o.minSpendThb ? o.discountThb / o.minSpendThb : 0);
const ids = (list: Offer[]) => list.map((o) => o.id);

/**
 * Prompts whose answer depends on live state are built from the feed at the
 * moment they are asked: brand coupons, points budget, perks, Central App
 * deals by category, expiring soon, earn.
 */
function resolveDynamic(userId: AppUserId, text: string, ctx: MuseContext): { reply: MuseReply; intent: string } | null {
  const t = text.toLowerCase();
  const redeemable = (o: Offer) => (o.offerType === 'Redeem Points' || o.offerType === 'Redeem Cash') && o.pointsCost > 0 && usable(o, ctx);
  const byMargin = (a: Offer, b: Offer) => (pointsPerBaht(a) ?? 99) - (pointsPerBaht(b) ?? 99) || b.redemptions - a.redemptions;

  // "What can I redeem with my points?" (live balance) or "I have 1,500 points, what can I redeem?" (typed budget)
  const pts = t.match(/(\d[\d,]*)\s*(points?|pts)/);
  const askBudget = (pts && /(redeem|what can|get|buy|use)/.test(t)) || /(redeem|get|use|buy).*(my points|with my points|my balance)|what can i redeem/.test(t);
  if (askBudget) {
    const budget = pts ? Number(pts[1].replace(/,/g, '')) : ctx.points;
    const mine = !pts;
    const list = catalogue.filter((o) => redeemable(o) && o.pointsCost <= budget).sort(byMargin).slice(0, 4);
    if (!list.length) {
      const cheapest = catalogue.filter(redeemable).sort((a, b) => a.pointsCost - b.pointsCost).slice(0, 2);
      return {
        intent: 'budget',
        reply: {
          kind: 'support',
          text: `${mine ? `You have ${formatPoints(ctx.points)} points today` : `At ${formatPoints(budget)} points`}, so nothing is redeemable yet — the cheapest perk is ${formatPoints(cheapest[0]?.pointsCost ?? 450)} points. Coupons are free, and a challenge is the quickest way to your first points.`,
          chips: ['Balance-aware', 'Earn first'],
          results: ids(cheapest),
          reasons: cheapest.map((o) => `${formatPoints(o.pointsCost)} pts · first perk to aim for`),
          action: { label: 'See challenges', chapter: 6 },
          followups: ['How can I earn bonus points this month?', 'Show me free coupons'],
        },
      };
    }
    return {
      intent: 'budget',
      reply: {
        kind: 'commerce',
        text: `${mine ? `With your ${formatPoints(ctx.points)} points` : `With ${formatPoints(budget)} points`} you can redeem these — best value per point first (8 points = ฿1 is the cash benchmark):`,
        chips: [mine ? `Balance: ${formatPoints(ctx.points)} pts` : `Budget: ${formatPoints(budget)} pts`, 'User margin', 'Redeem Points / Redeem Cash'],
        results: ids(list),
        reasons: list.map((o) => `${formatPoints(o.pointsCost)} pts · ${pointsPerBaht(o)} per ฿1${(pointsPerBaht(o) ?? 9) < 8 ? ' · beats cash' : ''}`),
        followups: ['Any free movie or food perks?', 'Which coupons expire soon?', 'Help me find a gift'],
      },
    };
  }

  // "Any free movie or food perks?" — honest about points for a 0-balance member.
  if (/(movie|film|cinema|food|snack).*(perk|free)|(perk|free).*(movie|film|cinema|food|snack)|\bperks?\b/.test(t) && !/coupon/.test(t)) {
    const perks = catalogue.filter((o) => o.offerType === 'Redeem Points' && (o.category === 'Food & Beverage' || o.tags.some((x) => ['movie', 'cinema', 'popcorn'].includes(x))) && usable(o, ctx));
    const affordable = perks.filter((o) => o.pointsCost <= ctx.points).sort(byMargin).slice(0, 4);
    if (affordable.length) {
      return {
        intent: 'perks-free',
        reply: {
          kind: 'commerce',
          text: 'Yes — these movie and food perks are redeemed with points, no cash, and all within your balance. Best value per point first:',
          chips: ['Free Entertainment & Food Perks', `Within ${formatPoints(ctx.points)} pts`],
          results: ids(affordable),
          reasons: affordable.map((o) => `${formatPoints(o.pointsCost)} pts · ${pointsPerBaht(o)} per ฿1`),
          followups: ['What can I redeem with my points?', 'Help me find a gift'],
        },
      };
    }
    const cheapest = perks.sort((a, b) => a.pointsCost - b.pointsCost).slice(0, 3);
    const starter = catalogue.find((o) => o.id === '300033' && !ctx.joinedIds.has(o.id)) ?? catalogue.find((o) => o.id === '300032');
    return {
      intent: 'perks-free',
      reply: {
        kind: 'commerce',
        text: `Perks like free movie tickets and drinks are redeemed with points — you have ${formatPoints(ctx.points)} today, so none are unlocked yet. These are the cheapest to aim for, and the challenge below gets you there fastest. Coupons, meanwhile, are free to collect.`,
        chips: ['Balance-aware', 'Earn first', 'Cheapest perks'],
        results: ids([...cheapest, ...(starter ? [starter] : [])]),
        reasons: [...cheapest.map((o) => `${formatPoints(o.pointsCost)} pts · ${formatPoints(o.pointsCost - ctx.points)} to go`), ...(starter ? [`+${formatPoints(starter.rewardPoints ?? 0)} pts · ${starter.subtitle}`] : [])],
        action: { label: 'See challenges', chapter: 6 },
        followups: ['Show me free coupons', 'How does The 1 work?'],
      },
    };
  }

  // "Best fashion / beauty / electronics deals on Central App"
  if (/central app|the app/.test(t)) {
    const cat = /beauty|skincare|makeup/.test(t) ? 'Beauty' : /electronic|tech|tv|gadget|appliance/.test(t) ? 'Electronics' : 'Fashion';
    const list = catalogue
      .filter((o) => o.offerType === 'Central App Deal' && o.category === cat && usable(o, ctx))
      .sort((a, b) => (b.discountThb ?? 0) / (b.minSpendThb ?? 1) - (a.discountThb ?? 0) / (a.minSpendThb ?? 1) || (b.multiplier ?? 0) - (a.multiplier ?? 0))
      .slice(0, 4);
    if (list.length)
      return {
        intent: `app-${cat.toLowerCase()}`,
        reply: {
          kind: 'commerce',
          text: `The best ${cat.toLowerCase()} deals on Central App right now — on-top discounts and point multipliers you only get in the app:`,
          chips: ['Central App Extra Discounts', `Category: ${cat}`],
          results: ids(list),
          reasons: list.map((o) => (o.multiplier ? `x${o.multiplier} The 1 points` : `On-top ${formatThb(o.discountThb ?? 0)} off ${formatThb(o.minSpendThb ?? 0)}`)),
          followups: ['Help me find a gift', 'Which coupons expire soon?'],
        },
      };
  }

  // "Which coupons expire soon?"
  if (/expir|ending soon|end(s)? soon|last chance/.test(t) && /(coupon|deal|offer|soon|which)/.test(t)) {
    const list = catalogue
      .filter((o) => ['Coupon', 'Phrom Pay Coupon'].includes(o.offerType) && daysUntil(o.validUntil) <= 14 && usable(o, ctx))
      .sort((a, b) => daysUntil(a.validUntil) - daysUntil(b.validUntil) || b.redemptions - a.redemptions)
      .slice(0, 4);
    return {
      intent: 'expiring-coupons',
      reply: {
        kind: 'commerce',
        text: `${list.length} coupons you can still collect end within two weeks — soonest first. Collect now, use before the date:`,
        chips: ['valid_until ≤ 14 days', 'Ending soon'],
        results: ids(list),
        reasons: list.map((o) => {
          const d = daysUntil(o.validUntil);
          return d === 0 ? 'Ends today' : d === 1 ? 'Ends tomorrow' : `Ends ${shortDate(o.validUntil)} · ${d} days`;
        }),
        followups: ['What free coupons can I get at Tops this week?', 'Any free movie or food perks?'],
      },
    };
  }

  // "How can I earn bonus points this month?" — acknowledges a mission already in progress.
  if (/(earn|bonus|more points|x\d|multiplier)/.test(t) && !/(expir|redeem)/.test(t)) {
    const list = catalogue
      .filter((o) => o.offerType === 'Challenge' && !ctx.joinedIds.has(o.id) && daysUntil(o.validUntil) >= 0)
      .sort((a, b) => (b.multiplier ? 10000 : b.rewardPoints ?? 0) - (a.multiplier ? 10000 : a.rewardPoints ?? 0))
      .slice(0, 4);
    const inProgress = Object.entries(ctx.joined)
      .map(([id, spent]) => ({ o: catalogue.find((c) => c.id === id), spent }))
      .find((x) => x.o?.minSpendThb && x.spent < x.o.minSpendThb && x.spent > 0);
    const lead = inProgress?.o
      ? `You’re ${formatThb(inProgress.o.minSpendThb! - inProgress.spent)} from finishing the ${inProgress.o.brand} challenge (+${formatPoints(inProgress.o.rewardPoints ?? 0)} points) — do that first. Then this month’s biggest earners: `
      : userId === 1
        ? 'Fastest way to your first points: '
        : 'This month’s biggest earners: ';
    return {
      intent: 'earn-bonus',
      reply: {
        kind: 'commerce',
        text: `${lead}join a challenge — it’s free — and bonus points land on top of what you earn anyway.`,
        chips: ['offer_type = Challenge', 'reward_points · points_multiplier', ...(inProgress ? ['Progress-aware'] : [])],
        results: ids(list),
        reasons: list.map((o) => (o.multiplier ? `x${o.multiplier} points on every basket` : `+${formatPoints(o.rewardPoints ?? 0)} bonus · ${o.subtitle}`)),
        action: { label: 'See all challenges', chapter: 6 },
        followups: [ctx.points > 0 ? 'What can I redeem with my points?' : 'Show me free coupons', 'Which coupons expire soon?'],
      },
    };
  }

  // "What free coupons can I get at Tops this week?" / "I'm buying a laptop at Power Buy, any discounts?"
  const brand = brandIn(t);
  if (brand && brand !== 'Central App' && /(coupon|discount|deal|offer|buying|save|free)/.test(t)) {
    const family = brand === 'Tops' ? (o: Offer) => o.topsFamily && o.channel.includes('In-store') : (o: Offer) => o.brand === brand;
    const freeOnly = /free/.test(t) && !/discount|buying/.test(t);
    const coupons = catalogue
      .filter((o) => family(o) && ['Coupon', 'Phrom Pay Coupon'].includes(o.offerType) && usable(o, ctx) && (!freeOnly || o.pointsCost === 0))
      .sort((a, b) => (freeOnly ? value(b) - value(a) : (b.discountThb ?? 0) - (a.discountThb ?? 0)));
    const challenge = catalogue.find((o) => o.offerType === 'Challenge' && o.brand === brand && !ctx.joinedIds.has(o.id));
    const list = [...coupons.slice(0, challenge ? 3 : 4), ...(challenge ? [challenge] : [])];
    if (!list.length) return null;
    const skipped = catalogue.filter((o) => o.brand === brand && (ctx.walletIds.has(o.id) || ctx.redeemedIds.has(o.id))).length;
    const big = t.match(/(laptop|tv|phone|fridge|sofa|bag|shoes|stroller)/);
    const redz = ctx.hasRedzCard && big ? ' Pay with your Central The 1 REDZ card and the whole basket earns x3 points.' : '';
    return {
      intent: `brand:${brand}`,
      reply: {
        kind: 'commerce',
        text: big
          ? `Buying a ${big[1]} at ${brand}? The biggest discount first — stack it with the ${brand} challenge to earn bonus points on the same receipt.${redz}`
          : `Free ${brand} coupons you can collect this week${skipped ? ` (I’ve skipped ${skipped} you already have)` : ''} — best value for a typical basket first:`,
        chips: [`Brand: ${brand}`, freeOnly ? 'price = 0' : 'discount_thb · min_spend_thb', ...(redz ? ['REDZ x3'] : ['Valid this week'])],
        results: ids(list),
        reasons: list.map((o) => (o.offerType === 'Challenge' ? `+${formatPoints(o.rewardPoints ?? 0)} bonus · ${o.subtitle}` : o.discountThb && o.minSpendThb ? `${formatThb(o.discountThb)} off ${formatThb(o.minSpendThb)} · ${Math.round(value(o) * 100)}%` : o.subtitle ?? '')),
        followups: ['Which coupons expire soon?', 'How can I earn bonus points this month?'],
      },
    };
  }

  return null;
}

/**
 * Everyday phrasing — "anything free?", "freebies", "any promo?", "โปร", "cheap deals",
 * "what's good", "dessert deals" — answered with the member's best free coupons,
 * narrowed to a topic when one is mentioned, their own brands first. Runs after
 * every specific rule so it never shadows them.
 */
const casualWords = /\b(free|freebies?|promo(tion)?s?|sale|cheap|bargain|what'?s good|recommend|suggest|anything good|best deals?|deals?|offers?|discounts?|coupons?)\b|โปร|ฟรี|คูปอง|ลดราคา/;
const noise = new Set(['any', 'anything', 'show', 'me', 'find', 'the', 'a', 'an', 'for', 'some', 'good', 'best', 'deals', 'deal', 'offers', 'offer', 'discounts', 'discount', 'coupons', 'coupon', 'free', 'freebies', 'promo', 'promos', 'promotion', 'sale', 'cheap', 'bargain', 'whats', "what's", 'is', 'there', 'got', 'have', 'you', 'i', 'want', 'need', 'please', 'recommend', 'suggest', 'something', 'stuff', 'things', 'ideas', 'on', 'at', 'in', 'my', 'and', 'or', 'to']);

function resolveGeneric(text: string, ctx: MuseContext): { reply: MuseReply; intent: string } | null {
  const t = text.toLowerCase();
  const casual = casualWords.test(t);
  // Brand affinity outweighs category affinity so a weekly Tops shopper sees Tops before Tops Online.
  const aff = (o: Offer) => Math.max((ctx.affinities[o.category] ?? 0) * 0.6, ctx.affinities[`brand:${o.brandId}`] ?? 0);
  const topicWords = t.replace(/[?!.,]/g, '').split(/\s+/).filter((w) => w && !noise.has(w));
  // Try each word as typed, pluralised and singularised so "shoe" finds "shoes".
  const terms = topicWords.length ? expandQuery(topicWords.flatMap((w) => [w, `${w}s`, w.replace(/s$/, '')]).join(' ')) : [];
  const all = catalogue.filter((o) => o.offerType === 'Coupon' && o.pointsCost === 0 && usable(o, ctx));
  const topical = terms.length ? all.filter((o) => o.tags.some((x) => terms.includes(x)) || terms.includes(o.category.toLowerCase())) : [];
  // A bare topic ("kids stuff") counts; otherwise we need a deal-ish word to avoid answering random text.
  if (!casual && !topical.length) return null;
  const pool = topical.length ? topical : all;
  const list = pool
    .sort((a, b) => aff(b) - aff(a) || value(b) - value(a) || b.redemptions - a.redemptions)
    .filter((o, i, arr) => arr.findIndex((x) => x.brandId === o.brandId) === i)
    .slice(0, 4);
  const personal = list.some((o) => aff(o) > 0);
  const topic = topical.length ? topicWords.join(' ') : null;
  return {
    intent: topic ? `casual:${topic}` : 'freebies',
    reply: {
      kind: 'commerce',
      text: topic
        ? `${topic.charAt(0).toUpperCase() + topic.slice(1)} — these are free to collect${personal ? ', your brands first' : ''}. Show your QR at checkout and the discount applies:`
        : personal
          ? 'Plenty. These are free to collect and lean towards the brands you already shop — show your QR at checkout and the discount applies:'
          : 'Plenty — coupons here cost nothing to collect. These are the best-value ones right now; show your QR at checkout and the discount applies:',
      chips: ['price = 0', ...(topic ? [`Intent: ${topic}`] : []), personal ? 'Your brands first' : 'Most collected'],
      results: ids(list),
      reasons: list.map((o) => (aff(o) >= 0.4 ? `${o.brand} · one of your brands` : o.discountThb && o.minSpendThb ? `${formatThb(o.discountThb)} off ${formatThb(o.minSpendThb)} · ${Math.round(value(o) * 100)}%` : o.subtitle ?? '')),
      followups: ['Which coupons expire soon?', ctx.points > 0 ? 'What can I redeem with my points?' : 'How does The 1 work?', 'Help me find a gift'],
    },
  };
}

/* ================================================================== */
/* Exports                                                             */
/* ================================================================== */

const scriptsByUser: Record<AppUserId, Record<string, MuseReply>> = { 1: ployScripts, 2: natScripts };
const rulesByUser: Record<AppUserId, { match: RegExp; key: string }[]> = { 1: ployRules, 2: natRules };

export const musePromptsByUser: Record<AppUserId, MusePrompt[]> = {
  1: [
    { id: 'p1', label: 'How does The 1 work?', icon: 'school', intent: 'how-it-works' },
    { id: 'p2', label: 'Show me free coupons', icon: 'confirmation_number', intent: 'free-coupons' },
    { id: 'p3', label: 'Find me a coffee deal', icon: 'coffee', intent: 'coffee' },
    { id: 'p4', label: 'How do I earn points fast?', icon: 'flag', intent: 'earn' },
    { id: 'p5', label: 'Something for beauty', icon: 'spa', intent: 'beauty' },
    { id: 'p6', label: 'What can points get me?', icon: 'currency_exchange', intent: 'points-value' },
  ],
  2: [
    { id: 'n1', label: 'Use my expiring points', icon: 'hourglass_top', intent: 'expiring' },
    { id: 'n2', label: 'What can I use at Tops this week?', icon: 'shopping_basket', intent: 'tops' },
    { id: 'n3', label: 'Something for the kids this weekend', icon: 'family_restroom', intent: 'kids' },
    { id: 'n4', label: 'How far is my Tops challenge?', icon: 'flag', intent: 'tops-challenge' },
    { id: 'n5', label: 'Find me a coffee deal', icon: 'coffee', intent: 'coffee' },
    { id: 'n6', label: 'How do I reach The 1 Exclusive?', icon: 'workspace_premium', intent: 'level' },
  ],
};

/**
 * Shared prompts from The 1's list — all typeable by anyone, but only surfaced
 * as chips when they make sense for this member:
 *  - "redeem with my points" needs a balance;
 *  - Tops / earn prompts are hidden where the persona already has a richer
 *    version of the same question;
 *  - the Central App prompt follows the member's strongest category.
 */
export function commonPromptsFor(userId: AppUserId, ctx: MuseContext): { label: string; icon: string }[] {
  const cat = (ctx.affinities.Beauty ?? 0) > (ctx.affinities.Fashion ?? 0) && (ctx.affinities.Beauty ?? 0) > (ctx.affinities.Electronics ?? 0) ? 'beauty' : (ctx.affinities.Electronics ?? 0) > (ctx.affinities.Fashion ?? 0) ? 'electronics' : 'fashion';
  const all: { label: string; icon: string; show: boolean }[] = [
    { label: 'What free coupons can I get at Tops this week?', icon: 'shopping_basket', show: userId !== 2 },
    { label: 'What can I redeem with my points?', icon: 'currency_exchange', show: ctx.points > 0 },
    { label: 'Any free movie or food perks?', icon: 'theaters', show: true },
    { label: "I'm buying a laptop at Power Buy, any discounts?", icon: 'laptop_mac', show: true },
    { label: 'How can I earn bonus points this month?', icon: 'flag', show: userId !== 1 },
    { label: "I'm traveling next month, any insurance deals?", icon: 'flight', show: true },
    { label: 'Which coupons expire soon?', icon: 'hourglass_top', show: true },
    { label: `Best ${cat} deals on Central App`, icon: cat === 'beauty' ? 'spa' : cat === 'electronics' ? 'devices' : 'checkroom', show: true },
    { label: 'Help me find a gift', icon: 'redeem', show: true },
  ];
  return all.filter((p) => p.show).map(({ label, icon }) => ({ label, icon }));
}

export const proactiveNudgeByUser: Record<AppUserId, ProactiveNudge> = {
  1: {
    text: 'Hi Ploy, welcome to The 1! Coupons here are free to collect and every one earns points. Want a 20-second tour?',
    cta: 'Show me how it works',
    intent: 'how-it-works',
  },
  2: {
    text: 'Hi Nat — 3,200 of your points expire on 31 Dec. Want me to find the best-value ways to use them before your Tops shop this week?',
    cta: 'Use my expiring points',
    intent: 'expiring',
  },
};

const fallbackByUser: Record<AppUserId, MuseReply> = {
  1: {
    kind: 'support',
    text: 'I can explain how The 1 works, find free coupons for what you’re into, or show you the fastest way to earn points. Try one of these:',
    followups: ['How does The 1 work?', 'Show me free coupons', 'Help me find a gift'],
  },
  2: {
    kind: 'support',
    text: 'I can find the best value for your points, show what’s usable at Tops this week, or help with a gift. Try one of these:',
    followups: ['Use my expiring points', 'What can I use at Tops this week?', 'Help me find a gift'],
  },
};

/** Resolve an assistant reply for a starter-prompt intent, per persona. */
export function replyForIntent(userId: AppUserId, intent: string): MuseReply {
  return scriptsByUser[userId]?.[intent] ?? commonScripts[intent] ?? fallbackByUser[userId];
}

/**
 * Resolve an assistant reply for free-typed text. Order: feed-driven dynamic
 * answers → shared prompts → persona-specific scripts → everyday phrasing → fallback.
 */
export function replyForText(userId: AppUserId, text: string, ctx: MuseContext): { reply: MuseReply; intent?: string } {
  const dyn = resolveDynamic(userId, text, ctx);
  if (dyn) return dyn;
  const common = commonRules.find((r) => r.match.test(text));
  if (common) return { reply: adaptToBalance(commonScripts[common.key], ctx), intent: common.key };
  const rule = rulesByUser[userId]?.find((r) => r.match.test(text));
  if (rule) return { reply: scriptsByUser[userId][rule.key], intent: rule.key };
  const generic = resolveGeneric(text, ctx);
  if (generic) return generic;
  return { reply: fallbackByUser[userId] };
}

/** Affinity signal an intent represents (feeds real-time personalisation). */
export const intentAffinity: Record<string, string> = {
  coffee: 'Food & Beverage',
  'coffee-value': 'Food & Beverage',
  dessert: 'Food & Beverage',
  beauty: 'Beauty',
  fashion: 'Fashion',
  'app-fashion': 'Fashion',
  'app-beauty': 'Beauty',
  'app-electronics': 'Electronics',
  movie: 'Entertainment',
  'perks-free': 'Entertainment',
  luxury: 'Fashion',
  kids: 'Kids',
  'gift-kids': 'Kids',
  'gift-mum': 'Beauty',
  'gift-partner': 'Fashion',
  tops: 'Grocery',
  'brand:Tops': 'Grocery',
  'brand:Power Buy': 'Electronics',
  pet: 'Pet',
  insurance: 'Travel',
};
