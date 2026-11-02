import { useDemo } from '@/app/DemoContext';
import { chapters } from '@/app/chapters';
import { cn } from '@/hooks/utils';

/** Grid of all chapters for quick jumping from the presenter panel. */
export function DemoChapterStepper() {
  const { chapter, goToChapter } = useDemo();

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">Screens</p>
      <div className="grid grid-cols-2 gap-1.5">
        {chapters.map((c) => {
          const active = c.id === chapter;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => goToChapter(c.id)}
              aria-current={active ? 'step' : undefined}
              className={cn('flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors', active ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-black/[0.03]')}
            >
              <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black', active ? 'bg-white/20 text-white' : 'bg-canvas text-muted')}>{c.id}</span>
              <span className="block truncate text-xs font-bold">{c.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
