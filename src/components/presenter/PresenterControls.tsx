import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDemo, type AppUser } from '@/app/DemoContext';
import { appUserProfileById } from '@/mock-data/appUsers';
import { musePromptsByUser } from '@/mock-data/muse';
import { DemoChapterStepper } from './DemoChapterStepper';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn, formatPoints } from '@/hooks/utils';

const appUsers: { key: AppUser; label: string; sub: string }[] = [
  { key: 1, label: 'Ploy · New member', sub: 'Level 1 · 0 pts · first open · no history' },
  { key: 2, label: 'Nat · Returning Level 3', sub: '24,850 pts · 3,200 expiring · weekly Tops · family' },
];

/** Presenter story card summarising the selected persona for quick narration. */
function PersonaStory({ id }: { id: AppUser }) {
  const p = appUserProfileById(id);
  const prompts = musePromptsByUser[id].slice(0, 3).map((x) => x.label);

  const Block = ({ label, children }: { label: string; children: ReactNode }) => (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-0.5 text-[12px] leading-relaxed text-ink">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary-fixed/60 p-3.5">
      <div>
        <h3 className="font-heading text-base font-extrabold text-ink">
          {p.name} · {p.tier}
        </h3>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{p.brief}</p>
      </div>
      <Block label="Key signals">
        <ul className="flex flex-wrap gap-1.5">
          {p.why.map((w) => (
            <li key={w.label} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ink shadow-sm">
              {w.label}
            </li>
          ))}
        </ul>
      </Block>
      <Block label="Personalisation rationale">{p.whyShownNow}</Block>
      <Block label="Demo objectives">
        <ul className="list-disc pl-4">
          {p.demoObjectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </Block>
      <Block label="Key assistant prompts">
        <ul className="list-disc pl-4">
          {prompts.map((pr) => (
            <li key={pr}>“{pr}”</li>
          ))}
        </ul>
      </Block>
    </div>
  );
}

function Toggle({ on, onChange, label, sub, icon, disabled }: { on: boolean; onChange: () => void; label: string; sub: string; icon: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onChange} disabled={disabled} aria-pressed={on} className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors', on ? 'bg-ink text-white' : 'bg-white text-ink', disabled && 'opacity-40')}>
      <Icon name={icon} filled={on} className="text-[20px]" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold">{label}</span>
        <span className={cn('block truncate text-[10px]', on ? 'text-white/70' : 'text-muted')}>{sub}</span>
      </span>
      <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', on ? 'bg-primary' : 'bg-black/15')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', on ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </span>
    </button>
  );
}

/** The presenter control panel used on desktop side rail and mobile sheet. */
export function PresenterControls({ onClose }: { onClose?: () => void }) {
  const { nextChapter, prevChapter, resetDemo, appUser, setAppUser, appUserProfile, points, wallet, usedIds, joined, sessionAffinity, sortMode, setSortMode, bannerIndex, setBannerIndex } = useDemo();
  const [showStory, setShowStory] = useState(false);
  const liveCount = Object.keys(sessionAffinity).filter((k) => !k.startsWith('tag:')).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 no-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Presenter mode</p>
          <h2 className="text-lg font-extrabold text-ink">Demo controls</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close presenter controls" className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-ink">
            ✕
          </button>
        )}
      </div>

      {/* App user switcher */}
      <div className="rounded-2xl border border-black/[0.08] bg-white/75 p-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">App user</p>
        <div className="flex flex-col gap-1.5">
          {appUsers.map((m) => {
            const active = appUser === m.key;
            return (
              <button key={m.key} type="button" onClick={() => setAppUser(m.key)} aria-pressed={active} className={cn('flex flex-col rounded-xl px-3 py-2 text-left transition-colors', active ? 'bg-ink text-white' : 'bg-surface-container-low text-ink hover:bg-surface-container')}>
                <span className="text-xs font-bold">{m.label}</span>
                <span className={cn('text-[10px]', active ? 'text-white/70' : 'text-muted')}>{m.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DY simulation toggles */}
      <div className="rounded-2xl border border-black/[0.08] bg-white/75 p-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Dynamic Yield controls</p>
        <div className="flex flex-col gap-1.5">
          <Toggle on={sortMode === 'today'} onChange={() => setSortMode(sortMode === 'today' ? 'dy' : 'today')} label="Compare: The 1 today" sub={sortMode === 'today' ? 'Newest first, no filtering (current app)' : 'Showing DY sorting + merchandising rules'} icon="compare_arrows" />
        </div>
        <div className="mt-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">Generative banner variant</p>
          <div className="flex gap-1.5">
            {appUserProfile.bannerVariants.map((b, i) => (
              <button key={b.id} type="button" onClick={() => setBannerIndex(i)} aria-pressed={bannerIndex === i} title={b.note} className={cn('flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold', bannerIndex === i ? 'bg-ink text-white' : 'bg-white text-ink')}>
                {String.fromCharCode(65 + i)}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[10px] leading-snug text-muted">{appUserProfile.bannerVariants[bannerIndex]?.note}</p>
        </div>
      </div>

      {/* Live state */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <Stat label="Balance" value={`${formatPoints(points)} pts`} />
        <Stat label="Coupons" value={`${wallet.filter((id) => !usedIds.includes(id)).length} ready · ${usedIds.length} used`} />
        <Stat label="Challenges" value={`${Object.keys(joined).length} joined`} />
        <Stat label="Live signals" value={liveCount ? `${liveCount} affinit${liveCount === 1 ? 'y' : 'ies'}` : 'none yet'} />
      </div>

      <div>
        <button type="button" onClick={() => setShowStory((open) => !open)} aria-expanded={showStory} className="flex w-full items-center justify-between rounded-2xl border border-black/[0.08] bg-white/75 px-3 py-2 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Persona story</span>
          <span className="text-xs font-bold text-primary">{showStory ? 'Hide' : 'Show'}</span>
        </button>
        <AnimatePresence initial={false}>
          {showStory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="pt-2">
                <PersonaStory id={appUser} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <DemoChapterStepper />
        <div className="grid grid-cols-2 gap-1.5">
          <Button variant="outline" size="sm" onClick={prevChapter} aria-label="Previous step">
            ← Prev
          </Button>
          <Button variant="outline" size="sm" onClick={nextChapter} aria-label="Next step">
            Next →
          </Button>
        </div>
      </div>

      <Button variant="outline" size="sm" fullWidth onClick={resetDemo} aria-label="Reset demo to start">
        ↺ Reset demo
      </Button>
      <p className="text-[10px] leading-relaxed text-muted">
        Press <kbd className="rounded bg-black/[0.06] px-1">P</kbd> to toggle this panel and <kbd className="rounded bg-black/[0.06] px-1">T</kbd> to flip “The 1 today”. Tap “Why this?” in the app to open the reasoning rail.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/75 px-2.5 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="truncate font-semibold text-ink">{value}</p>
    </div>
  );
}
