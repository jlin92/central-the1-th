import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { SectionHeader } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { offers } from '@/mock-data/offers';
import { onlyForYou } from '@/services/selectors';
import type { Offer } from '@/types';
import { cn, shortDate } from '@/hooks/utils';

/** Chapter 5 — My Coupons: the wallet of collected coupons, with "use now" QR. */
export function CouponsScreen() {
  const { wallet, usedIds, useCoupon, goToChapter, location, rankContext, openDetail } = useDemo();
  const [tab, setTab] = useState<'ready' | 'used'>('ready');
  const [using, setUsing] = useState<Offer | null>(null);
  const all = offers(wallet);
  const ready = all.filter((o) => !usedIds.includes(o.id));
  const used = all.filter((o) => usedIds.includes(o.id));
  // In-store coupons for the current location float to the top of the wallet.
  const sorted = location ? [...ready.filter((o) => o.brandId === location.brandId), ...ready.filter((o) => o.brandId !== location.brandId)] : ready;
  const list = tab === 'ready' ? sorted : used;
  const suggestions = onlyForYou(rankContext, 4).map((s) => s.offer);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        <div className="flex rounded-full bg-surface-container-high p-1">
          {(['ready', 'used'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn('flex-1 rounded-full py-2 text-[13px] font-semibold', tab === t ? 'bg-white text-on-surface shadow-card' : 'text-on-surface-variant')}>
              {t === 'ready' ? `Ready to use (${ready.length})` : `Used (${used.length})`}
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <Icon name="confirmation_number" className="text-[36px] text-primary" />
            <p className="mt-2 font-heading text-[16px] font-bold text-on-surface">{tab === 'ready' ? 'No coupons yet' : 'Nothing used yet'}</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">{tab === 'ready' ? 'Collect free coupons and they’ll appear here, ready for checkout.' : 'Coupons you show at checkout move here.'}</p>
            {tab === 'ready' && (
              <button type="button" onClick={() => goToChapter(chapterIdByKey('search'))} className="mt-3 rounded-md bg-the1-black px-5 py-2.5 text-[13px] font-semibold text-white">
                Find coupons
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {list.map((o, i) => {
            const here = location && o.brandId === location.brandId && o.channel.includes('In-store');
            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <button type="button" onClick={() => openDetail(o)} className="flex w-full items-center gap-3 p-3 text-left">
                  <BrandTile brandId={o.brandId} className="h-16 w-24 shrink-0 rounded-lg" size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] uppercase tracking-wide text-on-surface-variant">{o.brand}</p>
                    <p className="font-heading text-[17px] font-bold leading-tight text-on-surface">{o.title}</p>
                    <p className="truncate text-[11px] text-on-surface-variant">{o.subtitle ?? o.channel} · until {shortDate(o.validUntil)}</p>
                    {here && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-the1-green-soft px-1.5 py-0.5 text-[10px] font-bold text-success">
                        <Icon name="location_on" filled className="text-[12px]" />
                        Use here
                      </span>
                    )}
                  </div>
                </button>
                <div className="ticket-notch ticket-dash flex items-center justify-between px-3 py-2">
                  <span className="text-[11px] text-on-surface-variant">{tab === 'ready' ? 'Show at checkout' : 'Used'}</span>
                  {tab === 'ready' ? (
                    <button type="button" onClick={() => setUsing(o)} className="rounded-md bg-the1-black px-4 py-1.5 text-[12px] font-semibold text-white">
                      Use now
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-success">
                      <Icon name="check_circle" filled className="text-[16px]" />
                      Done
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {tab === 'ready' && suggestions.length > 0 && (
          <section>
            <SectionHeader title="Add to your wallet" action="See all" onAction={() => goToChapter(chapterIdByKey('search'))} />
            <div className="mt-2 grid grid-cols-2 gap-3">
              {suggestions.map((o, i) => (
                <OfferCard key={o.id} offer={o} index={i} />
              ))}
            </div>
          </section>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>

      {/* Use-now QR sheet */}
      <AnimatePresence>
        {using && (
          <div className="absolute inset-0 z-40 flex items-end">
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUsing(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full rounded-t-2xl bg-white p-5 text-center">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15" />
              <p className="text-[12px] uppercase tracking-wide text-on-surface-variant">{using.brand}</p>
              <p className="font-heading text-[22px] font-bold text-on-surface">{using.title}</p>
              <div className="mx-auto my-4 flex h-40 w-40 items-center justify-center rounded-2xl border border-surface-container-high">
                <Icon name="qr_code_2" className="text-[120px] text-on-surface" />
              </div>
              <p className="text-[12px] text-on-surface-variant">Show this code at the till. Code: T1-{using.id.slice(-4)}-{String(using.redemptions).slice(0, 3)}</p>
              <button
                type="button"
                onClick={() => {
                  useCoupon(using.id);
                  setUsing(null);
                }}
                className="mt-4 w-full rounded-md bg-the1-black py-3 text-[14px] font-semibold text-white"
              >
                Mark as used (cashier scanned)
              </button>
              <button type="button" onClick={() => setUsing(null)} className="mt-1 w-full py-2 text-[13px] font-semibold text-on-surface-variant">
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
