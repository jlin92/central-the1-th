import { useDemo } from '@/app/DemoContext';
import { chapterById } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';
import { RankingBoard } from './RankingBoard';
import { liveBanner } from '@/services/selectors';
import { topSessionAffinity } from '@/services/sortEngine';

/**
 * Left-side "Why shown now" panel. Opens when the member taps "Why this?" or
 * "Why this order?" and explains the signals and the sort behind what the
 * selected member is seeing right now.
 */
export function WhyShownPanel({ onClose }: { onClose?: () => void }) {
  const { appUserProfile, chapter, sessionAffinity, ranking, sortMode, bannerIndex } = useDemo();
  const { name, context, why, whyShownNow } = appUserProfile;
  const screen = chapterById(chapter);
  const liveSignals = Object.entries(sessionAffinity)
    .filter(([k]) => !k.startsWith('tag:'))
    .sort((a, b) => b[1] - a[1]);
  const isNew = appUserProfile.homeVariant === 'newMember';
  const live = topSessionAffinity(sessionAffinity);

  const treatment = (() => {
    switch (screen.key) {
      case 'home': {
        const banner = isNew && live && liveBanner(live) ? `Generated banner from live “${live}” affinity` : `Generative banner variant ${String.fromCharCode(65 + bannerIndex)} · ${appUserProfile.bannerVariants[bannerIndex]?.note ?? ''}`;
        return `${banner}. ${appUserProfile.homeSections.find((s) => s.id === 'foryou')?.strategy ?? ''}`;
      }
      case 'search':
        return isNew
          ? 'Smart search expands intent words (“coffee”, “กาแฟ”, “luxury bag”) to tagged offers; results and chips re-rank from live affinity; ineligible / out-of-stock / already-collected coupons are filtered; a hand-off card routes the query to Shopping Muse.'
          : 'Category pages sorted by affinity + user margin; redeemed, wallet and cardholder offers filtered; chips ordered by her brands. Smart search hands off to Shopping Muse.';
      case 'brand':
        return sortMode === 'today'
          ? 'The 1 today: newest first, no filtering — Tops Online coupons sit on top for an in-store shopper, out-of-stock and wallet items still show.'
          : 'Brand hub sorted by affinity (weekly in-store Tops), user margin and popularity; wallet / redeemed / OOS filtered.';
      case 'detail':
        return isNew ? 'Eligibility + value panel; if short of points, a challenge that earns the gap is recommended (gamification next-best action).' : 'Value panel shows points-per-baht vs the 8:1 benchmark; related offers from the same brand/category; challenge progress where joined.';
      case 'coupons':
        return 'Suggestions below the wallet use the Only for You ranking.';
      case 'challenge':
        return isNew ? 'Earn boost: with a low balance, challenges are promoted and sorted easiest-to-earn first.' : 'Targeted mission pinned; joined challenge shows live progress; others ranked by her brand affinities.';
      case 'redeem':
        return 'Custom algorithm (Algorithm Studio): cash coupons and perks ranked by value per point within balance — partner perks that beat 8:1 come first; expiring points drive urgency copy.';
      case 'account':
        return 'Level-aware benefits and progress; points history from offline transactions feeds affinity (Tops, Sephora, Power Buy).';
      default:
        return isNew ? 'Proactive education nudge · guided discovery prompts; each intent updates affinity in real time.' : 'Proactive expiry nudge · value-ranked results · redeemed-aware answers.';
    }
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 no-scrollbar">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Why shown now</p>
          <h2 className="text-lg font-extrabold text-ink">{name}</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close why shown now" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-ink">
            ✕
          </button>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted">{context}</p>

      <div className="rounded-2xl border border-primary/20 bg-primary-fixed p-3">
        <p className="text-xs font-bold text-primary">On this screen · {screen.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink">{treatment}</p>
      </div>

      {ranking && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Sorting optimiser · {ranking.title}
            {sortMode === 'today' && <span className="ml-1 rounded bg-black/[0.06] px-1.5 py-0.5 text-[10px] normal-case">The 1 today</span>}
          </p>
          {sortMode === 'today' ? (
            <p className="rounded-xl border border-dashed border-black/[0.12] bg-white/60 p-3 text-[11px] text-muted">Newest first, no scoring, no filtering — switch the presenter toggle back to Dynamic Yield to see the weighted ranking.</p>
          ) : (
            <RankingBoard ranked={ranking.ranked} excluded={ranking.excluded} />
          )}
        </div>
      )}

      <div className="rounded-2xl border border-black/[0.06] bg-white p-3">
        <p className="text-xs font-bold text-ink">Why this, right now</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{whyShownNow}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Live session signals</p>
        {liveSignals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/[0.12] bg-white/60 p-3 text-[11px] text-muted">Nothing yet — {isNew ? 'ranking is popularity-based. Tap a chip, open an offer or ask the assistant and come back.' : 'ranking uses her historic affinities. Browse to add live signals on top.'}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {liveSignals.map(([k, score], i) => (
              <li key={k} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${i === 0 ? 'bg-primary text-white' : 'bg-white text-ink shadow-sm'}`}>
                <Icon name="bolt" filled className="text-[12px]" />
                {k.replace(/^brand:/, '')} · {score}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Signals considered</p>
        {why.map((reason) => (
          <div key={reason.label} className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
              <Icon name={reason.icon} filled className="text-lg" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">{reason.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{reason.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-auto text-[10px] leading-relaxed text-muted">Reasoning is illustrative. Dynamic Yield sorts, filters and tests the experience via API against The 1’s own UI; Shopping Muse handles conversational discovery against the same offer feed.</p>
    </div>
  );
}
