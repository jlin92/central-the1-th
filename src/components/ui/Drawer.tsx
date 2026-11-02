import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { drawerVariants } from '@/animations/variants';
import { cn } from '@/hooks/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Constrain within the phone frame rather than the whole viewport. */
  contained?: boolean;
  labelledBy?: string;
}

/** Bottom sheet drawer. When contained, it absolutely positions inside the frame. */
export function Drawer({ open, onClose, title, children, contained = true }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            contained ? 'absolute' : 'fixed',
            'inset-0 z-40 flex items-end justify-center',
          )}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 max-h-[86%] w-full overflow-y-auto rounded-t-[28px] bg-card p-5 shadow-float no-scrollbar"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15" aria-hidden />
            {title && (
              <h3 className="mb-3 text-base font-extrabold text-ink">{title}</h3>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
