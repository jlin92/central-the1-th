import type { ReactNode } from 'react';
import { cn } from '@/hooks/utils';
import { Icon } from '@/components/ui/Icon';

interface MobileFrameProps {
  children: ReactNode;
  className?: string;
  /** Status bar colour scheme — light text over the dark home header. */
  dark?: boolean;
}

/** Android-style status bar: clock on the left, signal/wifi/battery on the right. */
function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={cn('relative z-40 flex h-11 shrink-0 items-center justify-between px-6 pt-1.5', dark ? 'text-white' : 'text-on-surface')}>
      <span className="font-heading text-sm font-semibold tracking-tight">12:03</span>
      <div className="flex items-center gap-1.5">
        <Icon name="signal_cellular_alt" filled className="text-[17px]" />
        <Icon name="wifi" filled className="text-[17px]" />
        <span className="flex items-center gap-0.5">
          <span className="text-[11px] font-semibold">79</span>
          <Icon name="battery_5_bar" filled className="rotate-90 text-[17px]" />
        </span>
      </div>
    </div>
  );
}

/**
 * Renders a phone frame with a punch-hole camera, status bar and gesture bar.
 * Children flow below the status bar; drawers/modals are contained within the
 * device viewport.
 */
export function MobileFrame({ children, className, dark }: MobileFrameProps) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[420px] select-none', className)}>
      <div className="relative rounded-[46px] bg-[#2a2a2e] p-[10px] shadow-frame">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[38px] bg-surface">
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 h-5 w-5 -translate-x-1/2 rounded-full bg-black ring-2 ring-black/60" />
          <div className="relative flex h-full flex-col">
            <div className={cn(dark ? 'the1-header-dark' : 'bg-white')}>
              <StatusBar dark={dark} />
            </div>
            {children}
          </div>
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-28 -translate-x-1/2 rounded-full bg-black/60" />
        </div>
      </div>
    </div>
  );
}
