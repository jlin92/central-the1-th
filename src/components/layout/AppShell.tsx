import { AnimatePresence, motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { screenByChapter } from '@/app/screens';
import { chapterById } from '@/app/chapters';
import { screenVariants } from '@/animations/variants';
import { MobileFrame } from '@/components/layout/MobileFrame';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScanPill } from '@/components/layout/ScanPill';
import { PresenterControls } from '@/components/presenter/PresenterControls';
import { WhyShownPanel } from '@/components/presenter/WhyShownPanel';
import { AssistantFab } from '@/components/muse/AssistantFab';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';

/**
 * Top-level shell: renders the phone frame with the active chapter screen,
 * the "Why shown now" rail on the left and presenter controls on the right.
 */
export function AppShell() {
  useKeyboardShortcuts();
  const { chapter, presenterOpen, setPresenterOpen, whyOpen, closeWhy, toast } = useDemo();
  const Screen = screenByChapter[chapter];
  const key = chapterById(chapter).key;
  const isHome = key === 'home';
  // The assistant has its own screen; detail/coupons have their own primary CTA.
  const showFab = !['muse', 'detail', 'coupons'].includes(key);
  const showScan = key !== 'muse';
  const compactScan = !['home', 'search', 'challenge'].includes(key);

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-6 px-4 py-6 lg:flex-row lg:items-start lg:justify-center lg:py-10">
        <AnimatePresence>
          {whyOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="hidden w-[340px] shrink-0 self-stretch lg:block"
            >
              <div className="sticky top-10 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-3xl bg-canvas shadow-card ring-1 ring-black/[0.04]">
                <WhyShownPanel onClose={closeWhy} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex flex-1 flex-col items-center">
          <BrandIntro />
          <MobileFrame dark={isHome}>
            <HeaderBar />

            <AnimatePresence mode="wait">
              <motion.main
                key={chapter}
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative flex flex-1 flex-col overflow-hidden"
              >
                <Screen />
                {showFab && <AssistantFab />}
                {showScan && <ScanPill compact={compactScan} />}
              </motion.main>
            </AnimatePresence>

            <BottomNav />

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-24 left-1/2 z-50 w-[85%] -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-center text-xs font-medium text-white shadow-float"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </MobileFrame>
        </div>

        <AnimatePresence>
          {presenterOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="hidden w-[340px] shrink-0 self-stretch lg:block"
            >
              <div className="sticky top-10 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-3xl bg-canvas shadow-card ring-1 ring-black/[0.04]">
                <PresenterControls onClose={() => setPresenterOpen(false)} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:hidden">
        <Drawer open={presenterOpen} onClose={() => setPresenterOpen(false)} title="Presenter controls" contained={false}>
          <PresenterControls onClose={() => setPresenterOpen(false)} />
        </Drawer>
        <Drawer open={whyOpen} onClose={closeWhy} title="Why shown now" contained={false}>
          <WhyShownPanel onClose={closeWhy} />
        </Drawer>
      </div>
    </div>
  );
}

function BrandIntro() {
  const { togglePresenter } = useDemo();
  return (
    <div className="mb-4 flex w-full max-w-[420px] items-center justify-between text-white/90">
      <div className="flex items-center gap-2">
        <img src="/the1/the1-logo.svg" alt="" className="h-6 w-6" />
        <span className="font-heading text-sm font-semibold">The 1 · Central Group</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">DY Demo</span>
      </div>
      <button
        type="button"
        onClick={togglePresenter}
        className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/20"
        title="Toggle presenter controls (P)"
      >
        <Icon name="tune" className="text-[15px]" />
        Presenter
      </button>
    </div>
  );
}
