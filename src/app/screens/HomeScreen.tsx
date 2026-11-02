import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { Carousel, HomeSection, WhyButton } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { brandStyle, catalogue } from '@/mock-data/offers';
import { primaryReason, topSessionAffinity } from '@/services/sortEngine';
import {
  bestValue,
  challengesForHome,
  dealsForHome,
  insuranceForHome,
  liveBanner,
  onlyForYou,
  onlyForYouFull,
  perksForHome,
  phromPayForHome,
} from '@/services/selectors';
import type { Banner, HomeSection as HomeSectionDef, Offer } from '@/types';
import { cn, formatPoints } from '@/hooks/utils';

const toneClass: Record<Banner['tone'], string> = {
  red: 'bg-primary text-white',
  dark: 'bg-the1-black text-white',
  gold: 'bg-[#2b2118] text-[#f3e3b4]',
  green: 'bg-[#0b5d3b] text-white',
};

/** Round brand shortcuts at the top of the home screen. */
function BrandRow() {
  const { appUserProfile, openBrand, trackAffinity, goToChapter, sessionAffinity } = useDemo();
  // Brands the member has interacted with this session move to the front.
  const order = useMemo(() => {
    const live = Object.entries(sessionAffinity)
      .filter(([k]) => k.startsWith('brand:'))
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k.slice(6))
      .filter((b) => brandStyle(b) && catalogue.some((o) => o.brandId === b));
    const base = appUserProfile.brandRow;
    return [...live.filter((b) => !base.includes(b) || base.indexOf(b) > 2), ...base.filter((b) => !live.includes(b) || base.indexOf(b) <= 2)]
      .filter((b, i, arr) => arr.indexOf(b) === i)
      .slice(0, 6);
  }, [appUserProfile, sessionAffinity]);
  return (
    <section className="flex items-center justify-between rounded-2xl bg-white px-3 py-2.5 shadow-card">
      {order.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => {
            trackAffinity(`brand:${b}`, 1);
            openBrand(b);
          }}
          className="flex flex-col items-center gap-1"
          aria-label={brandStyle(b).label}
        >
          <BrandTile brandId={b} round size="xs" className="h-12 w-12 ring-1 ring-black/5" />
        </button>
      ))}
      <button type="button" onClick={() => goToChapter(chapterIdByKey('search'))} aria-label="More brands" className="flex h-12 w-10 items-center justify-center text-on-surface">
        <Icon name="more_horiz" className="text-[26px]" />
      </button>
    </section>
  );
}

/** DY personalised banner — persona variant, or a live-generated one from in-session affinity. */
function HeroBanner() {
  const { appUserProfile, bannerIndex, goToChapter, openWhy, openBrand, sessionAffinity, setActiveChip, trackAffinity } = useDemo();
  const p = appUserProfile;
  const live = p.homeVariant === 'newMember' ? topSessionAffinity(sessionAffinity) : null;
  const liveB = live ? liveBanner(live) : null;
  const banner: (Banner & { chip?: string }) | undefined = liveB ?? p.bannerVariants[bannerIndex];
  if (!banner) return null;

  const go = () => {
    if (banner.brandId) return openBrand(banner.brandId);
    if (banner.chip) {
      setActiveChip(banner.chip);
      trackAffinity(live ?? '', 1);
    }
    goToChapter(banner.chapter);
  };

  return (
    <motion.section
      key={banner.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative overflow-hidden rounded-2xl p-4 shadow-card', toneClass[banner.tone])}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-3 top-3 z-10">
        <WhyButton onClick={openWhy} dark />
      </div>
      <div className="relative flex items-start gap-3 pr-24">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon name={banner.icon} filled className="text-[22px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-85">{banner.eyebrow}</p>
          <h2 className="mt-0.5 font-heading text-[18px] font-bold leading-tight">{banner.title}</h2>
          <p className="mt-1.5 text-[12px] leading-snug opacity-90">{banner.body}</p>
        </div>
      </div>
      <div className="relative mt-3 flex items-center justify-between">
        <button type="button" onClick={go} className="flex items-center gap-1 rounded-md bg-white px-3.5 py-2 text-[12px] font-semibold text-on-surface">
          {banner.cta}
          <Icon name="arrow_forward" className="text-[15px]" />
        </button>
        <span className="flex items-center gap-1 text-[10px] font-medium opacity-80">
          <Icon name="auto_awesome" className="text-[12px]" />
          {live ? 'Generated live' : 'Personalised'}
        </span>
      </div>
    </motion.section>
  );
}

/** New-member checklist, compact. */
function OnboardingCard() {
  const { appUserProfile, goToChapter, wallet, joined, usedIds } = useDemo();
  const steps = (appUserProfile.onboarding ?? []).map((s) => ({
    ...s,
    done:
      s.done ||
      (s.label.includes('coupon') && !s.label.includes('QR') && wallet.length > 0) ||
      (s.label.includes('challenge') && Object.keys(joined).length > 0) ||
      (s.label.includes('QR') && usedIds.length > 0),
  }));
  const done = steps.filter((s) => s.done).length;
  return (
    <section className="rounded-2xl bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-heading text-[15px] font-bold text-on-surface">Get started with The 1</p>
        <span className="text-[12px] font-semibold text-on-surface-variant">
          {done}/{steps.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {steps.map((s) => (
          <li key={s.label}>
            <button type="button" onClick={() => !s.done && goToChapter(s.chapter)} className="flex w-full items-center gap-1.5 text-left">
              <Icon name={s.done ? 'check_circle' : 'radio_button_unchecked'} filled={s.done} className={cn('text-[18px]', s.done ? 'text-success' : 'text-outline')} />
              <span className={cn('text-[12px] leading-tight', s.done ? 'text-on-surface-variant line-through' : 'font-semibold text-on-surface')}>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Render one feed-defined home shelf using the DY selectors. */
function Shelf({ def }: { def: HomeSectionDef }) {
  const { rankContext, goToChapter, setActiveChip, sessionAffinity, appUserProfile, joined, points } = useDemo();
  const live = appUserProfile.homeVariant === 'newMember' ? topSessionAffinity(sessionAffinity) : null;

  const content = useMemo(() => {
    switch (def.source) {
      case 'affinity': {
        const scored = onlyForYou(rankContext, 8);
        return { items: scored.map((s) => s.offer), reasons: scored.map((s) => primaryReason(s)) };
      }
      case 'challenges':
        return { items: challengesForHome(rankContext, 6), reasons: [] as (string | undefined)[] };
      case 'perks':
        return { items: perksForHome(rankContext, 8), reasons: [] };
      case 'deals':
        return { items: dealsForHome(rankContext, 8), reasons: [] };
      case 'insurance':
        return { items: insuranceForHome(rankContext, 6), reasons: [] };
      case 'phrompay':
        return { items: phromPayForHome(rankContext, 8), reasons: [] };
      case 'redeemCash': {
        const scored = bestValue(rankContext, 8);
        return { items: scored.map((s) => s.offer), reasons: scored.map((s) => s.factors.find((f) => f.key === 'margin')?.note) };
      }
      default:
        return { items: [] as Offer[], reasons: [] };
    }
  }, [def.source, rankContext]);

  if (!content.items.length) return null;

  const more = () => {
    if (def.source === 'challenges') return goToChapter(chapterIdByKey('challenge'));
    if (def.source === 'redeemCash') return goToChapter(chapterIdByKey('redeem'));
    if (def.source === 'perks') setActiveChip('perks');
    else setActiveChip(null);
    goToChapter(chapterIdByKey('search'));
  };

  const title = def.id === 'foryou' && live ? `Only for You · ${live.replace(/^brand:/, '')}` : def.title;
  const subtitle =
    def.id === 'foryou' && live ? (
      <span className="flex items-center gap-1 text-primary">
        <Icon name="bolt" filled className="text-[13px]" />
        Updated just now from what you tapped
      </span>
    ) : def.id === 'value' ? (
      `${formatPoints(points)} points available · best value per point first`
    ) : undefined;

  if (def.layout === 'challenge') {
    const joinedShown = Object.keys(joined).length > 0 && def.id === 'challenge';
    return (
      <HomeSection title={title} onMore={more} why={def.id === 'challenge'} subtitle={joinedShown ? `${Object.keys(joined).length} joined · see progress in Challenge` : undefined}>
        <Carousel itemWidth="w-[88%]">
          {content.items.slice(0, 4).map((o, i) => (
            <OfferCard key={o.id} offer={o} index={i} variant="challenge" />
          ))}
        </Carousel>
        <button type="button" onClick={() => goToChapter(chapterIdByKey('challenge'))} className="mt-2 w-full rounded-md bg-the1-black py-2.5 text-[13px] font-semibold text-white">
          Join All ({content.items.length})
        </button>
      </HomeSection>
    );
  }

  const variant = def.layout === 'deal' ? 'deal' : def.layout === 'insurance' ? 'insurance' : def.layout === 'perk' ? 'perk' : 'coupon';
  return (
    <HomeSection title={title} onMore={more} why={def.id === 'foryou' || def.id === 'value'} subtitle={subtitle}>
      <motion.div key={`${def.id}-${content.items.map((o) => o.id).join(',')}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Carousel itemWidth={def.layout === 'deal' || def.layout === 'insurance' ? 'w-[46%]' : 'w-[46%]'}>
          {content.items.map((o, i) => (
            <OfferCard key={o.id} offer={o} index={i} variant={variant} reason={content.reasons[i]} />
          ))}
        </Carousel>
      </motion.div>
    </HomeSection>
  );
}

/** Chapter 1 — The 1 home. */
export function HomeScreen() {
  const { appUserProfile, openBrand, rankContext, setRanking } = useDemo();
  const p = appUserProfile;

  useEffect(() => {
    const r = onlyForYouFull(rankContext);
    setRanking({ title: 'Only for You', ranked: r.ranked, excluded: r.excluded });
    return () => setRanking(null);
  }, [rankContext, setRanking]);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        <BrandRow />
        <HeroBanner />
        {p.homeVariant === 'newMember' && <OnboardingCard />}
        {p.expiringPoints && (
          <button type="button" onClick={() => openBrand('tops')} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed text-primary">
              <Icon name="hourglass_top" className="text-[22px]" />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-bold text-on-surface">
                {formatPoints(p.expiringPoints.amount)} points expire {p.expiringPoints.when}
              </span>
              <span className="block text-[11px] text-on-surface-variant">Use them on your weekly Tops shop or a perk below</span>
            </span>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>
        )}
        {p.homeSections.map((def) => (
          <Shelf key={def.id} def={def} />
        ))}
        <Disclaimer className="px-1 pb-2">{settings.disclaimers.illustrative}</Disclaimer>
      </div>
    </Screen>
  );
}
