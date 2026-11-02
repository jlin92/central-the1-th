import { useDemo } from '@/app/DemoContext';
import { chapterById, chapterIdByKey } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';
import { settings } from '@/mock-data/settings';
import { brandStyle } from '@/mock-data/offers';
import { cn, formatPoints, formatThb } from '@/hooks/utils';

/** "The 1 | Level 3" pill shown next to tab titles in the live app. */
export function TierBadge({ className }: { className?: string }) {
  const { appUserProfile } = useDemo();
  return (
    <span className={cn('inline-flex overflow-hidden rounded-md text-[11px] font-bold', className)}>
      <span className="bg-the1-black px-1.5 py-0.5 text-white">The 1</span>
      <span className="bg-primary px-1.5 py-0.5 text-white">{appUserProfile.tier}</span>
    </span>
  );
}

/** Coupon wallet counter (ticket icon + count) from the top-right of the live app. */
function WalletButton({ dark }: { dark?: boolean }) {
  const { wallet, usedIds, goToChapter } = useDemo();
  const n = wallet.filter((id) => !usedIds.includes(id)).length;
  return (
    <button
      type="button"
      onClick={() => goToChapter(chapterIdByKey('coupons'))}
      aria-label={`My Coupons, ${n}`}
      className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13px] font-bold', dark ? 'border-white/70 text-white' : 'border-on-surface text-on-surface')}
    >
      <Icon name="confirmation_number" className="text-[18px]" />
      {n}
    </button>
  );
}

function PointsLine({ dark, onClick }: { dark?: boolean; onClick: () => void }) {
  const { points } = useDemo();
  return (
    <button type="button" onClick={onClick} className={cn('flex items-center gap-1 text-left', dark ? 'text-white' : 'text-on-surface')}>
      <span className="font-heading text-[16px] font-bold">{formatPoints(points)}</span>
      <span className="text-[12px]">
        Points <span className="opacity-80">(≈{formatThb(points / settings.pointsPerBaht)})</span>
      </span>
      <Icon name="chevron_right" className="text-[16px]" />
    </button>
  );
}

/**
 * Top app bar, matching The 1 app:
 *  - Home: near-black bar with "0 Points (≈฿0) >" and the coupon counter.
 *  - Search / Challenge / Account: white bar with title + tier badge, a Redeem Cash
 *    button, points line and the red "Points History | Member Benefits" band.
 *  - Sub-screens: white bar with back chevron and centred title.
 */
export function HeaderBar() {
  const { chapter, goToChapter, appUserProfile, brandId, detailItem, showToast } = useDemo();
  const meta = chapterById(chapter);
  const account = chapterIdByKey('account');
  const redeem = chapterIdByKey('redeem');

  if (meta.key === 'home') {
    return (
      <header className="the1-header-dark relative z-30 flex items-center justify-between px-4 pb-3 pt-1 text-white">
        <PointsLine dark onClick={() => goToChapter(account)} />
        <WalletButton dark />
      </header>
    );
  }

  if (['search', 'challenge', 'account'].includes(meta.key)) {
    return (
      <header className="relative z-30 bg-white">
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-[20px] font-bold text-on-surface">{meta.key === 'account' ? appUserProfile.firstName : meta.title}</h1>
            <TierBadge />
          </div>
          <WalletButton />
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <PointsLine onClick={() => goToChapter(account)} />
          <button type="button" onClick={() => goToChapter(redeem)} className="rounded-md bg-surface-container px-3 py-1.5 text-[12px] font-semibold text-on-surface">
            Redeem Cash
          </button>
        </div>
        <div className="the1-band flex items-stretch text-white">
          <button type="button" onClick={() => goToChapter(account)} className="flex flex-1 items-center justify-center gap-1.5 py-2 text-[13px] font-semibold">
            <Icon name="history" className="text-[18px]" />
            Points History
            <Icon name="chevron_right" className="text-[16px]" />
          </button>
          <span className="my-2 w-px bg-white/50" />
          <button type="button" onClick={() => goToChapter(account)} className="flex flex-1 items-center justify-center gap-1.5 py-2 text-[13px] font-semibold">
            <Icon name="redeem" className="text-[18px]" />
            Member Benefits
            <Icon name="chevron_right" className="text-[16px]" />
          </button>
        </div>
      </header>
    );
  }

  const backTarget = (() => {
    switch (meta.key) {
      case 'detail':
        return detailItem?.offerType === 'Challenge' ? chapterIdByKey('challenge') : chapterIdByKey('search');
      case 'redeem':
        return chapterIdByKey('search');
      default:
        return 1;
    }
  })();
  const title = meta.key === 'brand' ? brandStyle(brandId).label : meta.key === 'detail' ? (detailItem?.brand ?? meta.title) : meta.title;

  return (
    <header className="relative z-30 flex h-12 items-center justify-between border-b border-surface-container-high bg-white px-2 text-on-surface">
      <button type="button" onClick={() => goToChapter(backTarget)} aria-label="Back" className="flex h-10 w-10 items-center justify-center">
        <Icon name="arrow_back" className="text-[22px]" />
      </button>
      <span className="truncate font-heading text-[16px] font-semibold">{title}</span>
      {meta.key === 'muse' ? (
        <button type="button" onClick={() => showToast('Conversation history is outside this demo')} aria-label="History" className="flex h-10 w-10 items-center justify-center">
          <Icon name="history" className="text-[22px]" />
        </button>
      ) : (
        <div className="pr-1">
          <WalletButton />
        </div>
      )}
    </header>
  );
}
