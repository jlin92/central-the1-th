import type { Chapter } from '@/types';

/**
 * Customer-facing screens of The 1 app built out for this demo. Home, Search,
 * Challenge and Account map to the live app's bottom tabs; the others are
 * reached from within those tabs.
 */
export const chapters: Chapter[] = [
  { id: 1, key: 'home', title: 'Home', copy: 'Personalised home with brand row, Only for You and challenges.', icon: 'home' },
  { id: 2, key: 'search', title: 'Search', copy: 'Smart search and category pages with DY sorting.', icon: 'search' },
  { id: 3, key: 'brand', title: 'Brand hub', copy: 'A brand page (e.g. Tops) with dynamically sorted offers.', icon: 'storefront' },
  { id: 4, key: 'detail', title: 'Offer', copy: 'Coupon detail, eligibility and next-best actions.', icon: 'confirmation_number' },
  { id: 5, key: 'coupons', title: 'My Coupons', copy: 'Collected coupons ready to use in store.', icon: 'wallet' },
  { id: 6, key: 'challenge', title: 'Challenge', copy: 'Gamified missions to earn points.', icon: 'flag' },
  { id: 7, key: 'redeem', title: 'Redeem Cash', copy: 'Turn points into cash coupons — best value first.', icon: 'currency_exchange' },
  { id: 8, key: 'account', title: 'Account', copy: 'Member level, points history and benefits.', icon: 'person' },
  { id: 9, key: 'muse', title: 'Assistant', copy: 'The 1 assistant, powered by Shopping Muse.', icon: 'auto_awesome' },
];

export const chapterById = (id: number): Chapter => chapters.find((c) => c.id === id) ?? chapters[0];

export const chapterIdByKey = (key: Chapter['key']): number => chapters.find((c) => c.key === key)?.id ?? 1;

export const totalChapters = chapters.length;
