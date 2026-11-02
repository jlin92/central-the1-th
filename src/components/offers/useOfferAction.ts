import { useDemo } from '@/app/DemoContext';
import type { Offer } from '@/types';

export interface OfferActionState {
  /** CTA label to render. */
  label: string;
  /** Visual state of the pill. */
  state: 'primary' | 'done' | 'disabled';
  /** Supporting note, e.g. "Earn 800 more". */
  note?: string;
  run: () => void;
}

/** Resolves what the card's CTA does for this member right now. */
export function useOfferAction(o: Offer): OfferActionState {
  const { points, wallet, usedIds, joined, addToWallet, redeemPoints, joinChallenge, showToast, goToChapter } = useDemo();
  const inWallet = wallet.includes(o.id);
  const used = usedIds.includes(o.id);

  switch (o.offerType) {
    case 'Coupon':
    case 'Phrom Pay Coupon':
      if (used) return { label: 'Used', state: 'done', run: () => goToChapter(5) };
      if (inWallet) return { label: 'In wallet', state: 'done', run: () => goToChapter(5) };
      if (!o.inStock) return { label: 'Sold out', state: 'disabled', run: () => showToast('This coupon is out of stock') };
      return { label: 'Get', state: 'primary', run: () => addToWallet(o) };
    case 'Redeem Cash':
    case 'Redeem Points':
      if (inWallet) return { label: 'Redeemed', state: 'done', run: () => goToChapter(5) };
      if (o.pointsCost > points)
        return {
          label: 'Redeem',
          state: 'disabled',
          note: `Earn ${(o.pointsCost - points).toLocaleString('en-US')} more`,
          run: () => showToast(`You need ${(o.pointsCost - points).toLocaleString('en-US')} more points — try a challenge`),
        };
      return { label: 'Redeem', state: 'primary', run: () => redeemPoints(o) };
    case 'Challenge':
      if (joined[o.id] != null) return { label: 'Joined', state: 'done', run: () => goToChapter(6) };
      return { label: 'Join', state: 'primary', run: () => joinChallenge(o) };
    case 'Central App Deal':
      return { label: 'Shop', state: 'primary', run: () => showToast('Opens Central App (outside this demo)') };
    case 'Card Offer':
      return { label: 'Apply Card', state: 'primary', run: () => showToast('Opens Central The 1 REDZ application (outside this demo)') };
    case 'Insurance':
      return { label: 'Buy', state: 'primary', run: () => showToast('Opens The 1 Insure (outside this demo)') };
    default:
      return { label: o.cta, state: 'primary', run: () => showToast('Outside this demo') };
  }
}
