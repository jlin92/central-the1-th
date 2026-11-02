import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppUserId, AppUserProfile, Offer, ScoredOffer } from '@/types';
import { appUserProfileById } from '@/mock-data/appUsers';
import { chapterIdByKey, totalChapters } from './chapters';
import type { RankContext, SortMode } from '@/services/sortEngine';

export type AppUser = AppUserId;

/** The list currently on screen, published by list screens for the reasoning rail. */
export interface CurrentRanking {
  title: string;
  ranked: ScoredOffer[];
  excluded: ScoredOffer[];
}

interface DemoContextValue {
  /** Current chapter (1-9). */
  chapter: number;
  goToChapter: (id: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;

  /** Selected persona and its full The 1 experience definition. */
  appUser: AppUser;
  setAppUser: (u: AppUser) => void;
  appUserProfile: AppUserProfile;

  /** Live points balance (decrements on redemption, increments on challenge completion). */
  points: number;

  /** Coupon wallet: offer ids collected this session plus the persona's starting wallet. */
  wallet: string[];
  addToWallet: (o: Offer) => void;
  usedIds: string[];
  useCoupon: (id: string) => void;
  /** Redeem a points-cost offer: deducts points and drops the coupon in the wallet. */
  redeemPoints: (o: Offer) => void;

  /** Challenges joined with current THB progress. */
  joined: Record<string, number>;
  joinChallenge: (o: Offer) => void;

  /** In-session affinity built from taps (category, brand:<id>, tag:<x>). */
  sessionAffinity: Record<string, number>;
  trackAffinity: (key: string, weight?: number) => void;

  /** Sorting mode for lists: DY vs the live app's "newest first". */
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;

  /** Ranking context for the sort engine, derived from the state above. */
  rankContext: RankContext;
  /** Ranked list currently on screen (for the "Why this order?" board). */
  ranking: CurrentRanking | null;
  setRanking: (r: CurrentRanking | null) => void;

  /** Brand hub currently open. */
  brandId: string;
  openBrand: (brandId: string) => void;

  /** Offer on the Detail screen. */
  detailItem: Offer | null;
  openDetail: (o: Offer) => void;

  /** Search state. */
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeChip: string | null;
  setActiveChip: (c: string | null) => void;

  /** Hand a question to the assistant (from search). */
  musePrefill: string | null;
  askMuse: (q: string) => void;
  clearMusePrefill: () => void;

  /** Which generative banner variant is live. */
  bannerIndex: number;
  setBannerIndex: (i: number) => void;

  /** Panels. */
  whyOpen: boolean;
  openWhy: () => void;
  closeWhy: () => void;
  presenterOpen: boolean;
  setPresenterOpen: (open: boolean) => void;
  togglePresenter: () => void;
  qrOpen: boolean;
  setQrOpen: (open: boolean) => void;

  toast: string | null;
  showToast: (t: string) => void;

  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState(1);
  const [appUser, setAppUserState] = useState<AppUser>(1);
  const [presenterOpen, setPresenterOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Offer | null>(null);
  const [brandId, setBrandId] = useState('tops');
  const [walletExtra, setWalletExtra] = useState<string[]>([]);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [joinedExtra, setJoinedExtra] = useState<Record<string, number>>({});
  const [spent, setSpent] = useState(0);
  const [earned, setEarned] = useState(0);
  const [sessionAffinity, setSessionAffinity] = useState<Record<string, number>>({});
  const [sortMode, setSortMode] = useState<SortMode>('dy');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChipState] = useState<string | null>(null);
  const [musePrefill, setMusePrefill] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [ranking, setRanking] = useState<CurrentRanking | null>(null);

  const appUserProfile = useMemo(() => appUserProfileById(appUser), [appUser]);
  const points = appUserProfile.points - spent + earned;
  const wallet = useMemo(() => [...appUserProfile.walletIds, ...walletExtra], [appUserProfile, walletExtra]);
  const joined = useMemo(() => ({ ...appUserProfile.joined, ...joinedExtra }), [appUserProfile, joinedExtra]);

  const goToChapter = useCallback((id: number) => setChapter(Math.min(Math.max(1, id), totalChapters)), []);
  const nextChapter = useCallback(() => setChapter((c) => Math.min(c + 1, totalChapters)), []);
  const prevChapter = useCallback(() => setChapter((c) => Math.max(c - 1, 1)), []);

  const showToast = useCallback((t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const trackAffinity = useCallback((key: string, weight = 1) => {
    if (!key) return;
    setSessionAffinity((a) => ({ ...a, [key]: (a[key] ?? 0) + weight }));
  }, []);

  const resetSession = useCallback(() => {
    setChapter(1);
    setDetailItem(null);
    setBrandId('tops');
    setWalletExtra([]);
    setUsedIds([]);
    setJoinedExtra({});
    setSpent(0);
    setEarned(0);
    setSessionAffinity({});
    setSortMode('dy');
    setSearchQuery('');
    setActiveChipState(null);
    setMusePrefill(null);
    setBannerIndex(0);
    setWhyOpen(false);
    setQrOpen(false);
  }, []);

  const setAppUser = useCallback(
    (u: AppUser) => {
      setAppUserState(u);
      resetSession();
    },
    [resetSession],
  );

  const resetDemo = useCallback(() => {
    setAppUserState(1);
    resetSession();
  }, [resetSession]);

  const openDetail = useCallback(
    (o: Offer) => {
      setDetailItem(o);
      trackAffinity(o.category, 1);
      trackAffinity(`brand:${o.brandId}`, 1);
      setChapter(chapterIdByKey('detail'));
    },
    [trackAffinity],
  );

  const openBrand = useCallback((b: string) => {
    setBrandId(b);
    setChapter(chapterIdByKey('brand'));
  }, []);

  const addToWallet = useCallback(
    (o: Offer) => {
      setWalletExtra((w) => (w.includes(o.id) ? w : [...w, o.id]));
      trackAffinity(o.category, 2);
      trackAffinity(`brand:${o.brandId}`, 2);
      showToast(`${o.brand} ${o.title} added to My Coupons`);
    },
    [showToast, trackAffinity],
  );

  const useCoupon = useCallback(
    (id: string) => {
      setUsedIds((u) => (u.includes(id) ? u : [...u, id]));
      // The "first coupon" mission completes the moment a coupon is used.
      setJoinedExtra((j) => (j['300033'] != null ? { ...j, '300033': 1 } : j));
      showToast('Coupon used — points will land after checkout');
    },
    [showToast],
  );

  const redeemPoints = useCallback(
    (o: Offer) => {
      setSpent((s) => s + o.pointsCost);
      setWalletExtra((w) => (w.includes(o.id) ? w : [...w, o.id]));
      trackAffinity(o.category, 2);
      showToast(`Redeemed · ${o.pointsCost.toLocaleString('en-US')} points used`);
    },
    [showToast, trackAffinity],
  );

  const joinChallenge = useCallback(
    (o: Offer) => {
      setJoinedExtra((j) => (j[o.id] != null ? j : { ...j, [o.id]: 0 }));
      trackAffinity(`brand:${o.brandId}`, 1);
      showToast(`Joined · ${o.brand} challenge`);
    },
    [showToast, trackAffinity],
  );

  const setActiveChip = useCallback((c: string | null) => setActiveChipState(c), []);

  const askMuse = useCallback((q: string) => {
    setMusePrefill(q);
    setChapter(chapterIdByKey('muse'));
  }, []);
  const clearMusePrefill = useCallback(() => setMusePrefill(null), []);

  const togglePresenter = useCallback(() => setPresenterOpen((o) => !o), []);
  const openWhy = useCallback(() => setWhyOpen(true), []);
  const closeWhy = useCallback(() => setWhyOpen(false), []);

  const rankContext = useMemo<RankContext>(
    () => ({
      profile: appUserProfile,
      points,
      sessionAffinity,
      redeemedIds: new Set([...appUserProfile.redeemedIds, ...usedIds]),
      walletIds: new Set(wallet),
      joinedIds: new Set(Object.keys(joined)),
      mode: sortMode,
    }),
    [appUserProfile, points, sessionAffinity, usedIds, wallet, joined, sortMode],
  );

  const value: DemoContextValue = {
    chapter,
    goToChapter,
    nextChapter,
    prevChapter,
    appUser,
    setAppUser,
    appUserProfile,
    points,
    wallet,
    addToWallet,
    usedIds,
    useCoupon,
    redeemPoints,
    joined,
    joinChallenge,
    sessionAffinity,
    trackAffinity,
    sortMode,
    setSortMode,
    rankContext,
    ranking,
    setRanking,
    brandId,
    openBrand,
    detailItem,
    openDetail,
    searchQuery,
    setSearchQuery,
    activeChip,
    setActiveChip,
    musePrefill,
    askMuse,
    clearMusePrefill,
    bannerIndex,
    setBannerIndex,
    whyOpen,
    openWhy,
    closeWhy,
    presenterOpen,
    setPresenterOpen,
    togglePresenter,
    qrOpen,
    setQrOpen,
    toast,
    showToast,
    resetDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within a DemoProvider');
  return ctx;
}
