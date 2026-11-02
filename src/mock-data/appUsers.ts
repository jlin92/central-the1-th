import type { AppUserId, AppUserProfile } from '@/types';

/**
 * Two contrasting The 1 members who move through the same app (Home → Search →
 * Brand hub → Offer → My Coupons → Challenge → Redeem Cash) but see very
 * different content, sorting and emphasis on every screen.
 *
 *  - Persona 1 (Ploy): NEW member who opened The 1 for the first time today.
 *    0 points, Level 1, no history. Cold start on popularity + free coupons,
 *    gamification promoted so she can earn, and real-time affinity that
 *    re-ranks the app within the session as she browses.
 *
 *  - Persona 2 (Nat): RETURNING Level 3 member, weekly Tops shopper, mum of
 *    two, Sephora regular, Central The 1 REDZ cardholder. 24,850 points with
 *    3,200 expiring. Sees expiry urgency, affinity + user-margin sorting,
 *    suppression of what she already has, challenge progress, and a store
 *    location signal that re-sorts the Tops hub when she is in store.
 *
 * All values are illustrative for demonstration only.
 */
export const appUserProfiles: Record<AppUserId, AppUserProfile> = {
  /* ------------------------------------------------------------------ */
  /* Persona 1 — Ploy · New The 1 member (first open)                     */
  /* ------------------------------------------------------------------ */
  1: {
    id: 1,
    name: 'Ploy Siriwan',
    firstName: 'Ploy',
    tier: 'Level 1',
    points: 0,
    memberSince: 'Today',
    context: 'Registered 4 minutes ago · First app open · 0 points · No purchase or browsing history.',
    brief: 'Brand-new member, Level 1, 0 points. First visit — no affinity yet; the app builds it live as she browses.',
    homeVariant: 'newMember',
    affinities: {},
    redeemedIds: [],
    recentPurchases: [],
    pinned: ['200001'],
    walletIds: [],
    joined: {},
    hasRedzCard: false,
    bannerVariants: [
      {
        id: 'p1-welcome',
        eyebrow: 'Welcome to The 1',
        title: 'Start with free coupons — no points needed',
        body: 'Hundreds of coupons are free to collect. Pick one, show it at checkout and start earning points on the same receipt.',
        cta: 'Get my first coupon',
        chapter: 2,
        tone: 'red',
        icon: 'confirmation_number',
        note: 'Generated for the “new member, 0 points” audience: leads with zero-cost value and explains the earn loop.',
      },
      {
        id: 'p1-earn',
        eyebrow: 'Challenge of the month',
        title: 'Earn 1,111 points on your first Central shop',
        body: 'Join the Central App challenge and your first ฿10,000 basket earns 1,111 bonus points on top.',
        cta: 'See challenges',
        chapter: 6,
        tone: 'dark',
        icon: 'flag',
        note: 'Variant B: gamification-led. DY tests both and allocates traffic to the winner per audience.',
      },
      {
        id: 'p1-how',
        eyebrow: 'How The 1 works',
        title: 'Earn 1 point for every ฿25. Use 8 points as ฿1.',
        body: 'Points add up across Central, Robinson, Tops, Power Buy, SuperSports and more — one membership, every store.',
        cta: 'Ask the assistant',
        chapter: 9,
        tone: 'green',
        icon: 'school',
        note: 'Variant C: education-led copy, routes to Shopping Muse for the “how does it work” conversation.',
      },
    ],
    onboarding: [
      { label: 'Join The 1', done: true, icon: 'looks_one', chapter: 1 },
      { label: 'Get your first coupon', done: false, icon: 'confirmation_number', chapter: 2 },
      { label: 'Join a challenge to earn points', done: false, icon: 'flag', chapter: 6 },
      { label: 'Show your QR at checkout', done: false, icon: 'qr_code_2', chapter: 5 },
    ],
    brandRow: ['central-department-store', 'tops', 'robinson', 'starbucks', 'power-buy', 'supersports', 'sephora'],
    categoryChips: ['cyber', 'perks', 'card', 'fnb', 'grocery', 'beauty', 'fashion', 'kids', 'entertainment', 'electronics', 'home', 'sports', 'travel'],
    homeSections: [
      { id: 'foryou', title: 'Only for You', strategy: 'Cold start: most-collected free coupons, filtered to what a Level 1 member with 0 points can use. Re-ranks in real time from this session’s taps.', layout: 'coupon', source: 'affinity' },
      { id: 'challenge', title: 'Challenge of The Month', strategy: 'Gamification boost: balance is 0, so missions that earn points are promoted above points-cost perks.', layout: 'challenge', source: 'challenges' },
      { id: 'deals', title: 'Central App Extra Discounts', strategy: 'Popularity-ranked Central App deals; no affinity yet.', layout: 'deal', source: 'deals' },
      { id: 'perks', title: 'Free Entertainment & Food Perks', strategy: 'Shown as aspiration with “earn X more points” — nothing is hidden, but nothing is misleading.', layout: 'perk', source: 'perks' },
      { id: 'phrompay', title: 'The 1 Phrom Pay', strategy: 'Level 1 coupons for paying with The 1 Phrom Pay — eligible from day one.', layout: 'coupon', source: 'phrompay' },
      { id: 'insurance', title: 'Buy Travel & Accident Insurance Here', strategy: 'Standard merchandised shelf.', layout: 'insurance', source: 'insurance' },
    ],
    benefits: [
      { icon: 'paid', title: 'Earn 1 point per ฿25', body: 'At every Central Group store and partner — Tops, Robinson, Power Buy, SuperSports and more.' },
      { icon: 'currency_exchange', title: 'Use 8 points as ฿1', body: 'Convert points into cash coupons or redeem partner perks that beat the 8:1 rate.' },
      { icon: 'confirmation_number', title: 'Free coupons every week', body: 'Collect coupons with no points required and show your QR at checkout.' },
      { icon: 'cake', title: 'Birthday privileges', body: 'Bonus points and partner treats in your birthday month.' },
      { icon: 'lock', title: 'Level 2 & 3 privileges', body: 'Unlock parking, lounges and early sale access as your spend grows.', tag: 'Spend ฿30,000+' },
    ],
    pointsHistory: [{ icon: 'celebration', title: 'Joined The 1', detail: 'Today · Level 1', points: 0 }],
    whyShownNow:
      'Ploy registered minutes ago and this is her first open. With no behaviour yet, DY leads with free coupons she can use today, promotes challenges so she can earn her first points, and explains the programme in context. Every tap in this session updates her affinity profile in real time, so Only for You, the category chips and the search results re-rank before she leaves the app.',
    why: [
      { icon: 'celebration', label: 'Joined today', detail: 'New-member audience: zero-cost value and education before promotion.' },
      { icon: 'account_balance_wallet', label: '0 points', detail: 'Points-cost perks filtered out of Only for You; challenges boosted so she can earn.' },
      { icon: 'history_toggle_off', label: 'No history', detail: 'Cold start on popularity until she browses.' },
      { icon: 'bolt', label: 'Real-time affinity', detail: 'Chips tapped and offers viewed re-rank the home, search and PLP instantly.' },
    ],
    demoObjectives: [
      'Personalise a cold-start member: free coupons, gamification, education.',
      'Build affinity live and re-rank Only for You, chips and search within one session.',
      'Smart search understands “coffee”, hands off to Shopping Muse.',
      'First coupon collected, first challenge joined — with a transparent “why”.',
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Persona 2 — Nat · Returning Level 3 member, weekly Tops shopper      */
  /* ------------------------------------------------------------------ */
  2: {
    id: 2,
    name: 'Natthaporn Chaiyaporn',
    firstName: 'Nat',
    tier: 'Level 3',
    points: 24850,
    expiringPoints: { amount: 3200, when: '31 Dec' },
    memberSince: 'Mar 2019',
    context: 'Level 3 since 2024 · Shops Tops Central Rama 9 every week · Mum of two (The 1 Family) · Sephora twice this quarter · Bought a TV at Power Buy 6 weeks ago · Redeemed Starbucks ฿50 Off 2 weeks ago · Central The 1 REDZ cardholder.',
    brief: 'Level 3, 24,850 pts with 3,200 expiring 31 Dec. Weekly Tops in-store shopper, family, beauty. Needs a reason to use points and a hub that shows the Tops coupons she can actually use.',
    homeVariant: 'returning',
    affinities: {
      Grocery: 0.95,
      'brand:tops': 0.95,
      Kids: 0.55,
      Beauty: 0.5,
      'brand:sephora': 0.5,
      'Food & Beverage': 0.4,
      'brand:starbucks': 0.45,
      Entertainment: 0.3,
      Electronics: 0.2,
    },
    redeemedIds: ['200180'],
    recentPurchases: ['Electronics'],
    pinned: ['300030'],
    walletIds: ['200042'],
    joined: { '200094': 3850 },
    hasRedzCard: true,
    location: { brandId: 'tops', store: 'Tops', branch: 'Central Rama 9' },
    bannerVariants: [
      {
        id: 'p2-expiry',
        eyebrow: 'Points expiring',
        title: '3,200 points expire on 31 Dec',
        body: 'That’s ฿400 off your weekly Tops shop — or a free Starbucks and a movie night. Use them before they go.',
        cta: 'Use expiring points',
        chapter: 7,
        tone: 'red',
        icon: 'hourglass_top',
        note: 'Generated for the “expiring points + grocery affinity” audience: urgency plus a concrete, personal example of value.',
      },
      {
        id: 'p2-challenge',
        eyebrow: 'Almost there',
        title: '฿1,150 to go on your Tops challenge',
        body: 'Finish this week’s shop and 500 bonus points land in your account.',
        cta: 'See my progress',
        chapter: 6,
        tone: 'dark',
        icon: 'flag',
        note: 'Variant B: progress-led copy from the joined-challenge signal. Tested against the expiry variant.',
      },
      {
        id: 'p2-family',
        eyebrow: 'Weekend with the kids?',
        title: 'SEA LIFE and KidZania are within your points',
        body: 'Family perks you can redeem today — no cash needed.',
        cta: 'See family perks',
        chapter: 2,
        tone: 'green',
        icon: 'family_restroom',
        note: 'Variant C: family-affinity copy for The 1 Family members with a large balance.',
      },
    ],
    brandRow: ['tops', 'central-department-store', 'sephora', 'robinson', 'starbucks', 'central-food-hall', 'the-1-insure'],
    categoryChips: ['grocery', 'beauty', 'kids', 'fnb', 'perks', 'entertainment', 'fashion', 'cyber', 'electronics', 'home', 'sports', 'travel', 'card'],
    homeSections: [
      { id: 'foryou', title: 'Only for You', strategy: 'Affinity (Tops, grocery, beauty, kids) blended with user margin. Suppressed: Starbucks ฿50 (redeemed), Tops ฿20 (already in wallet), Power Buy (TV bought 6 weeks ago), Card offers (cardholder).', layout: 'coupon', source: 'affinity' },
      { id: 'value', title: 'Best value for your points', strategy: 'Custom algorithm: perks and cash coupons ranked by points-per-baht within her 24,850 balance — partner perks that beat the 8:1 universal rate first.', layout: 'perk', source: 'redeemCash' },
      { id: 'challenge', title: 'Challenge of The Month', strategy: 'Targeted Tops weekly-shopper mission pinned on top; joined challenge shows live progress.', layout: 'challenge', source: 'challenges' },
      { id: 'deals', title: 'Central App Extra Discounts', strategy: 'Beauty brands first from her Sephora affinity.', layout: 'deal', source: 'deals' },
      { id: 'perks', title: 'Free Entertainment & Food Perks', strategy: 'Family and coffee perks first; everything shown is within her balance.', layout: 'perk', source: 'perks' },
      { id: 'insurance', title: 'Buy Travel & Accident Insurance Here', strategy: 'Standard merchandised shelf.', layout: 'insurance', source: 'insurance' },
    ],
    benefits: [
      { icon: 'local_parking', title: 'Free parking · 3 hours', body: 'At Central and Robinson department stores nationwide.', tag: 'Level 3' },
      { icon: 'chair', title: 'The 1 Exclusive lounge access', body: 'Member lounges at CentralWorld, Chidlom and Ladprao.', tag: 'Level 3' },
      { icon: 'event_available', title: 'Early access to Central sales', body: 'Shop Midnight Sale and Cyber Deals before everyone else.', tag: 'Level 3' },
      { icon: 'family_restroom', title: 'The 1 Family perks', body: 'Kids, beauty and fashion missions with bonus points for the household.', tag: 'Family' },
      { icon: 'credit_card', title: 'Central The 1 REDZ · x3 points', body: 'Your card earns triple points at Central Group stores.' },
      { icon: 'cake', title: 'Birthday x2 points', body: 'Double points for the whole of your birthday month.' },
    ],
    pointsHistory: [
      { icon: 'shopping_basket', title: 'Tops · Central Rama 9', detail: 'Sat 31 Oct · ฿1,860 · x3 REDZ', points: 223 },
      { icon: 'spa', title: 'Sephora · CentralWorld', detail: 'Sun 25 Oct · ฿2,990', points: 359 },
      { icon: 'confirmation_number', title: 'Coupon used · Starbucks ฿50 Off', detail: 'Mon 19 Oct · Starbucks Rama 9', points: 0 },
      { icon: 'shopping_basket', title: 'Tops · Central Rama 9', detail: 'Sat 24 Oct · ฿1,990 · x3 REDZ', points: 239 },
      { icon: 'tv', title: 'Power Buy · Samsung 65" TV', detail: 'Sun 20 Sep · ฿27,990 · x3 REDZ', points: 3359 },
    ],
    whyShownNow:
      'Nat is a Level 3 member who shops Tops in store every week, has two kids and a Sephora habit, and holds 24,850 points with 3,200 expiring on 31 Dec. DY leads with expiry urgency and a concrete use for those points, ranks Only for You by her affinities and by user margin, and suppresses what she already has (the Starbucks coupon she redeemed, the Tops coupon in her wallet, the TV category she just bought, card offers she already holds). When her phone reports she is inside Tops Central Rama 9, the Tops hub re-sorts so in-store coupons come first — not the newest Tops Online ones.',
    why: [
      { icon: 'hourglass_top', label: '3,200 pts expiring', detail: 'Expiry drives the home banner and the Redeem Cash shelf.' },
      { icon: 'shopping_basket', label: 'Weekly Tops in-store', detail: 'Grocery + Tops brand affinity; Tops Online coupons deprioritised.' },
      { icon: 'family_restroom', label: 'The 1 Family · 2 kids', detail: 'Kids perks and family missions eligible and promoted.' },
      { icon: 'block', label: 'Already has / bought', detail: 'Redeemed Starbucks ฿50, Tops ฿20 in wallet, TV from Power Buy, REDZ card — all suppressed.' },
      { icon: 'location_on', label: 'Store location (simulated)', detail: 'When at Tops Central Rama 9, in-store Tops coupons rank first.' },
    ],
    demoObjectives: [
      'Expiry urgency with a personal, concrete use for the points.',
      'Brand hub sorting: Tops in-store coupons first, not newest Tops Online — compare with “The 1 today”.',
      'User-margin algorithm: best value per point surfaces partner perks over 8:1 cash.',
      'Suppress redeemed / wallet / recently-purchased / cardholder offers.',
      'Location signal re-sorts the hub at the moment of purchase.',
    ],
  },
};

export const appUserProfileById = (id: AppUserId): AppUserProfile => appUserProfiles[id];
