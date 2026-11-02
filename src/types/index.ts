/* ------------------------------------------------------------------ */
/* Demo chapters                                                       */
/* ------------------------------------------------------------------ */

export type ChapterKey =
  | 'home'
  | 'search'
  | 'brand'
  | 'detail'
  | 'coupons'
  | 'challenge'
  | 'redeem'
  | 'account'
  | 'muse';

export interface Chapter {
  id: number;
  key: ChapterKey;
  title: string;
  copy: string;
  icon: string;
}

/* ------------------------------------------------------------------ */
/* Offer catalogue (from the DY product feed + generated extras)        */
/* ------------------------------------------------------------------ */

export type OfferType =
  | 'Coupon'
  | 'Phrom Pay Coupon'
  | 'Redeem Cash'
  | 'Challenge'
  | 'Redeem Points'
  | 'Central App Deal'
  | 'Card Offer'
  | 'Insurance';

export type OfferCta = 'Get' | 'Redeem' | 'Join' | 'Shop' | 'Apply Card' | 'Buy';

export interface Offer {
  id: string;
  name: string;
  /** Card headline, e.g. "฿150 Off", "Get 1,111 Points". */
  title: string;
  subtitle?: string;
  brand: string;
  brandId: string;
  image: string;
  /** Points required (0 for free coupons / challenges). */
  pointsCost: number;
  inStock: boolean;
  stockLevel: 'low' | 'normal';
  category: string;
  offerType: OfferType;
  cta: OfferCta;
  /** Home section the feed assigns this offer to. */
  section: string;
  discountThb?: number;
  minSpendThb?: number;
  rewardPoints?: number;
  multiplier?: number;
  memberLevel: string;
  channel: string;
  validUntil: string;
  /** Tops family store format (Tops, Tops Online, Tops daily…). */
  storeFormat?: string;
  topsFamily: boolean;
  /** Semantic keywords for smart search. */
  tags: string[];
  /** Estimated THB value of a points-only perk (for the user-margin algorithm). */
  valueThb?: number;
  /** 30-day redemptions (popularity). */
  redemptions: number;
  dateAdded: string;
}

/* ------------------------------------------------------------------ */
/* Personas                                                            */
/* ------------------------------------------------------------------ */

export type AppUserId = 1 | 2;
export type Tier = 'Level 1' | 'Level 2' | 'Level 3' | 'The 1 Exclusive';

export interface WhyReason {
  icon: string;
  label: string;
  detail: string;
}

/** A home banner creative. Several variants = DY generative experiences. */
export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  chapter: number;
  /** Optional brand hub to open when the CTA fires. */
  brandId?: string;
  tone: 'red' | 'dark' | 'gold' | 'green';
  icon: string;
  /** Presenter note on why this variant was generated. */
  note: string;
}

export interface OnboardingStep {
  label: string;
  done: boolean;
  icon: string;
  chapter: number;
}

export interface HomeSection {
  id: string;
  title: string;
  /** How the offers are chosen; shown in the Why panel. */
  strategy: string;
  layout: 'coupon' | 'challenge' | 'perk' | 'deal' | 'insurance';
  /** Explicit offer ids, or a runtime source. */
  offers?: string[];
  source?: 'affinity' | 'challenges' | 'perks' | 'deals' | 'insurance' | 'phrompay' | 'redeemCash';
}

export interface MemberBenefit {
  icon: string;
  title: string;
  body: string;
  tag?: string;
}

export interface PointsEvent {
  icon: string;
  title: string;
  detail: string;
  points: number;
}

export interface StoreLocation {
  brandId: string;
  store: string;
  branch: string;
}

/** Full The 1 experience definition for one persona. */
export interface AppUserProfile {
  id: AppUserId;
  name: string;
  firstName: string;
  tier: Tier;
  points: number;
  expiringPoints?: { amount: number; when: string };
  memberSince: string;
  context: string;
  brief: string;
  homeVariant: 'newMember' | 'returning';
  /** Seed affinities from historic behaviour (category or brand:<id>) → 0..1. */
  affinities: Record<string, number>;
  /** Offers already redeemed (suppressed by merchandising rules). */
  redeemedIds: string[];
  /** Recently purchased categories (AffinityML purchase-cadence suppression). */
  recentPurchases: string[];
  /** Targeted "personal items" that must stay pinned on top. */
  pinned: string[];
  /** Coupons already in the wallet when the demo starts. */
  walletIds: string[];
  /** Challenges already joined, with spend progress in THB. */
  joined: Record<string, number>;
  hasRedzCard: boolean;
  /** Location signal available for simulation. */
  location?: StoreLocation;
  bannerVariants: Banner[];
  onboarding?: OnboardingStep[];
  brandRow: string[];
  categoryChips: string[];
  homeSections: HomeSection[];
  benefits: MemberBenefit[];
  pointsHistory: PointsEvent[];
  whyShownNow: string;
  why: WhyReason[];
  demoObjectives: string[];
}

/* ------------------------------------------------------------------ */
/* Sorting engine                                                      */
/* ------------------------------------------------------------------ */

export interface RankFactor {
  key: 'affinity' | 'margin' | 'popularity' | 'location' | 'urgency' | 'gamification' | 'pinned';
  label: string;
  /** Normalised contribution 0..1 before weighting. */
  value: number;
  weight: number;
  note?: string;
}

export interface ScoredOffer {
  offer: Offer;
  score: number;
  factors: RankFactor[];
  /** When set, the offer is filtered out by a merchandising rule. */
  excluded?: string;
}

/* ------------------------------------------------------------------ */
/* Shopping Muse (The 1 assistant)                                     */
/* ------------------------------------------------------------------ */

export interface MuseReply {
  kind?: 'support' | 'commerce';
  text: string;
  bullets?: string[];
  chips?: string[];
  results?: string[];
  reasons?: string[];
  followups?: string[];
  action?: { label: string; chapter: number; brandId?: string };
}

export interface MusePrompt {
  id: string;
  label: string;
  icon: string;
  intent: string;
}

export interface ProactiveNudge {
  text: string;
  cta: string;
  intent: string;
}

export interface MuseMessage extends MuseReply {
  id: string;
  role: 'user' | 'assistant';
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export interface Settings {
  appName: string;
  poweredBy: string;
  /** Points needed for ฿1 on the universal cash coupon (benchmark). */
  pointsPerBaht: number;
  disclaimers: {
    illustrative: string;
    programmeRules: string;
    redeem: string;
  };
}
