import type { MouseEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Offer } from '@/types';
import { useDemo } from '@/app/DemoContext';
import { BrandTile } from './BrandTile';
import { useOfferAction, type OfferActionState } from './useOfferAction';
import { Icon } from '@/components/ui/Icon';
import { cn, daysUntil, formatPoints } from '@/hooks/utils';

interface OfferCardProps {
  offer: Offer;
  index?: number;
  /** Personalisation reason shown beneath the title (DY picks / assistant). */
  reason?: string;
  /** Small status badge over the brand block (e.g. "Usable here", "Ends in 2 days"). */
  badge?: string;
  /** Layout: coupon ticket (default), perk ticket, deal tile, challenge row, or compact row. */
  variant?: 'coupon' | 'perk' | 'deal' | 'challenge' | 'row' | 'insurance';
  className?: string;
}

const typeTag: Partial<Record<Offer['offerType'], string>> = {
  Coupon: 'Coupon',
  'Phrom Pay Coupon': 'Coupon',
  'Redeem Cash': 'Coupon',
  'Redeem Points': 'Coupon',
  Challenge: 'Challenge',
  'Central App Deal': 'Deal',
  'Card Offer': 'Card',
  Insurance: 'Insurance',
};

/** The black pill CTA used throughout the live app ("Get", "Join", "Redeem"). */
export function CtaPill({ action, size = 'md', className }: { action: OfferActionState; size?: 'sm' | 'md'; className?: string }) {
  const stop = (e: MouseEvent) => {
    e.stopPropagation();
    action.run();
  };
  return (
    <button
      type="button"
      onClick={stop}
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-md font-semibold transition-transform active:scale-95',
        size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-4 py-1.5 text-[13px]',
        action.state === 'primary' && 'bg-the1-black text-white',
        action.state === 'done' && 'bg-the1-green-soft text-success',
        action.state === 'disabled' && 'bg-surface-container text-on-surface-variant',
        className,
      )}
    >
      {action.state === 'done' && <Icon name="check" className="text-[14px]" />}
      {action.label}
    </button>
  );
}

/** Auto badge from offer state when none is passed explicitly. */
export function autoBadge(o: Offer): string | undefined {
  if (!o.inStock) return 'Sold out';
  if (o.stockLevel === 'low') return 'Running out';
  const d = daysUntil(o.validUntil);
  if (d >= 0 && d <= 2) return d === 0 ? 'Ends today' : `Ends in ${d} day${d === 1 ? '' : 's'}`;
  return undefined;
}

function Badge({ children, tone = 'red' }: { children: ReactNode; tone?: 'red' | 'dark' | 'green' }) {
  return (
    <span
      className={cn(
        'absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none',
        tone === 'red' && 'bg-primary text-white',
        tone === 'dark' && 'bg-black/75 text-white',
        tone === 'green' && 'bg-success text-white',
      )}
    >
      {children}
    </span>
  );
}

function Reason({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <span className={cn('flex items-start gap-1 text-[11px] leading-snug text-primary', className)}>
      <Icon name="auto_awesome" className="mt-px text-[12px]" />
      <span className="font-medium">{text}</span>
    </span>
  );
}

/** Offer card in The 1 visual language. */
export function OfferCard({ offer: o, index = 0, reason, badge, variant = 'coupon', className }: OfferCardProps) {
  const { openDetail, location } = useDemo();
  const action = useOfferAction(o);
  const shownBadge = badge ?? autoBadge(o);
  const hereBadge = location && o.brandId === location.brandId && o.channel.includes('In-store') ? 'Use here' : undefined;
  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.04 * Math.min(index, 8), duration: 0.3 },
  };

  if (variant === 'challenge') {
    return (
      <motion.button type="button" onClick={() => openDetail(o)} {...motionProps} className={cn('flex h-full w-full overflow-hidden rounded-xl bg-white text-left shadow-card', className)}>
        <div className="relative w-[42%] shrink-0">
          <BrandTile brandId={o.brandId} className="h-full min-h-[104px] w-full" size="sm" />
          <span className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded bg-white/90 text-primary">
            <Icon name="flag" filled className="text-[16px]" />
          </span>
          {shownBadge && <Badge>{shownBadge}</Badge>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between bg-surface-container-low p-3">
          <div>
            <span className="inline-block rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">Challenge</span>
            <p className="mt-1 font-heading text-[16px] font-bold leading-tight text-on-surface">{o.title}</p>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-2 text-[12px] leading-snug text-on-surface-variant">{o.subtitle}</p>
              <Reason text={reason} className="mt-0.5" />
            </div>
            <CtaPill action={action} size="sm" />
          </div>
        </div>
      </motion.button>
    );
  }

  if (variant === 'row') {
    return (
      <motion.button type="button" onClick={() => openDetail(o)} {...motionProps} className={cn('flex w-full items-center gap-3 rounded-xl bg-white p-2.5 text-left shadow-card', className)}>
        <BrandTile brandId={o.brandId} className="h-14 w-20 shrink-0 rounded-lg" size="xs" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] uppercase tracking-wide text-on-surface-variant">{o.brand}</span>
          <span className="block text-[14px] font-bold leading-snug text-on-surface">{o.title}</span>
          <span className="block truncate text-[12px] text-on-surface-variant">
            {o.pointsCost > 0 ? `${formatPoints(o.pointsCost)} Points` : o.subtitle}
          </span>
          <Reason text={reason} className="mt-0.5" />
        </span>
        <CtaPill action={action} size="sm" />
      </motion.button>
    );
  }

  if (variant === 'deal') {
    return (
      <motion.button type="button" onClick={() => openDetail(o)} {...motionProps} className={cn('flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-card', className)}>
        <div className="relative">
          <BrandTile brandId={o.brandId} className="aspect-[16/10] w-full" size="md" />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-primary px-1.5 py-1 text-[9px] font-black uppercase leading-none text-white">
            Central
            <br />
            App
          </span>
          {shownBadge && <Badge tone="dark">{shownBadge}</Badge>}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-snug text-on-surface">{o.title}</p>
          <Reason text={reason} />
          <CtaPill action={action} size="sm" className="mt-auto w-full" />
        </div>
      </motion.button>
    );
  }

  if (variant === 'insurance') {
    return (
      <motion.button type="button" onClick={() => openDetail(o)} {...motionProps} className={cn('flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-card', className)}>
        <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center bg-primary text-white">
          <span className="text-[10px] font-black uppercase tracking-wide opacity-90">The 1 Insure</span>
          <span className="mt-1 font-heading text-[15px] font-bold">{o.subtitle?.replace('Insurance', 'Insurance') ?? 'Insurance'}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-snug text-on-surface">{o.title}</p>
          <Reason text={reason} />
          <CtaPill action={action} size="sm" className="mt-auto w-full" />
        </div>
      </motion.button>
    );
  }

  // Coupon / perk ticket
  const isPerk = variant === 'perk' || o.pointsCost > 0;
  return (
    <motion.button type="button" onClick={() => openDetail(o)} {...motionProps} className={cn('flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-card', className)}>
      <div className="relative">
        <BrandTile brandId={o.brandId} className="aspect-[16/10] w-full" size="md" />
        <span className="absolute -bottom-2 left-2 rounded bg-[#6b6b73] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {typeTag[o.offerType] ?? 'Coupon'}
        </span>
        {(hereBadge || shownBadge) && <Badge tone={hereBadge ? 'green' : 'red'}>{hereBadge ?? shownBadge}</Badge>}
      </div>
      <div className="px-2.5 pb-2 pt-3.5">
        <p className="font-heading text-[18px] font-bold leading-tight text-on-surface">{o.title}</p>
        {o.subtitle && !isPerk && <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">{o.subtitle}</p>}
        {isPerk && o.subtitle && <p className="mt-0.5 line-clamp-1 text-[11px] text-on-surface-variant">{o.subtitle}</p>}
        <Reason text={reason} className="mt-1" />
      </div>
      <div className="ticket-notch ticket-dash mx-0 mt-auto flex items-center justify-between px-2.5 pb-2.5 pt-2">
        {isPerk ? (
          <span className="text-[12px] font-semibold text-on-surface">
            {formatPoints(o.pointsCost)} <span className="font-normal text-on-surface-variant">Points</span>
          </span>
        ) : (
          <span className="text-[11px] text-on-surface-variant">{action.note ?? ''}</span>
        )}
        <div className="flex flex-col items-end">
          <CtaPill action={action} size="sm" />
          {isPerk && action.note && <span className="mt-0.5 text-[10px] text-on-surface-variant">{action.note}</span>}
        </div>
      </div>
    </motion.button>
  );
}
