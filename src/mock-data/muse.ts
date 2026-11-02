import type { AppUserId, MusePrompt, MuseReply, ProactiveNudge } from '@/types';

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
  { match: /(free|coupon|get)/i, key: 'free-coupons' },
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
    text: 'For your Tops shop this week, these in-store coupons are usable at Central Rama 9. I’ve skipped Tops Online coupons and the ฿20 one already in your wallet.',
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
  here: {
    kind: 'commerce',
    text: 'You’re at Tops Central Rama 9. These are usable at this till right now — show your QR and they apply automatically:',
    chips: ['Store location', 'In-store only'],
    results: ['300006', '300005', '300008', '200077'],
    reasons: ['฿60 off ฿800', '฿30 off ฿500', 'x2 points on Tops Own Brand', 'Phrom Pay ฿40 off'],
    action: { label: 'Open Tops hub', chapter: 3, brandId: 'tops' },
    followups: ['How far is my Tops challenge?', 'Use my expiring points'],
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
    text: 'For you, yes — it fits your usual spend, you haven’t redeemed it before, and it stacks with the points you earn on the receipt. If you’re at Tops this week, use the ฿60 off first; it’s the better ratio for your basket size.',
    chips: ['User margin', 'Eligibility ✓'],
    followups: ['What can I use at Tops this week?', 'Use my expiring points'],
  },
};

const natRules: { match: RegExp; key: string }[] = [
  { match: /(good deal|worth it|should i)/i, key: 'deal-check' },
  { match: /\b(here|at tops|in store|in-store|checkout|right now|till)\b/i, key: 'here' },
  { match: /(challenge|progress|how far|mission)/i, key: 'tops-challenge' },
  { match: /(tops|grocer|weekly|shop this week|supermarket)/i, key: 'tops' },
  { match: /(movie|cinema|film|หนัง|date night)/i, key: 'movie' },
  { match: /(kid|child|family|weekend|son|daughter)/i, key: 'kids' },
  { match: /(beauty|sephora|makeup|skincare|เครื่องสำอาง)/i, key: 'beauty' },
  { match: /(coffee|cafe|café|กาแฟ|starbucks)/i, key: 'coffee' },
  { match: /(level|exclusive|benefit|lounge|parking)/i, key: 'level' },
  { match: /(card|redz|credit)/i, key: 'card' },
  { match: /(expir|use my points|points|redeem|cash|value|lose)/i, key: 'expiring' },
];

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
    followups: ['How does The 1 work?', 'Show me free coupons', 'Find me a coffee deal'],
  },
  2: {
    kind: 'support',
    text: 'I can find the best value for your points, show what’s usable at Tops this week, or plan something for the kids. Try one of these:',
    followups: ['Use my expiring points', 'What can I use at Tops this week?', 'Something for the kids this weekend'],
  },
};

/** Resolve an assistant reply for a starter-prompt intent, per persona. */
export function replyForIntent(userId: AppUserId, intent: string): MuseReply {
  return scriptsByUser[userId]?.[intent] ?? fallbackByUser[userId];
}

/** Resolve an assistant reply for free-typed text, per persona. Returns the matched intent too. */
export function replyForText(userId: AppUserId, text: string): { reply: MuseReply; intent?: string } {
  const rule = rulesByUser[userId]?.find((r) => r.match.test(text));
  if (rule) return { reply: scriptsByUser[userId][rule.key], intent: rule.key };
  return { reply: fallbackByUser[userId] };
}

/** Affinity signal an intent represents (feeds real-time personalisation). */
export const intentAffinity: Record<string, string> = {
  coffee: 'Food & Beverage',
  'coffee-value': 'Food & Beverage',
  dessert: 'Food & Beverage',
  beauty: 'Beauty',
  fashion: 'Fashion',
  movie: 'Entertainment',
  luxury: 'Fashion',
  kids: 'Kids',
  tops: 'Grocery',
  here: 'Grocery',
};
