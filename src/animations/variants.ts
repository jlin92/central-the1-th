import type { Variants, Transition } from 'framer-motion';

/** Shared Framer Motion variants and transitions for consistent, fast motion. */

export const easeOut: Transition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };
export const easeSnappy: Transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

/** Screen (chapter) enter/exit transition. */
export const screenVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: easeOut },
  exit: { opacity: 0, y: -12, transition: easeSnappy },
};

/** Staggered container for lists of cards. */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

/** Individual card entrance used with staggerContainer. */
export const cardEntrance: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: easeOut,
  },
};

/** Signal chip assembly used in the Decision Theatre. */
export const signalAssembly: Variants = {
  initial: { opacity: 0, x: -14, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: easeOut,
  },
};

/** Checklist item completion. */
export const checkItem: Variants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: easeOut },
};

/** Winner highlight pulse. */
export const winnerHighlight: Variants = {
  initial: { scale: 0.98, boxShadow: '0 0 0 rgba(191,0,0,0)' },
  animate: {
    scale: 1,
    boxShadow: '0 18px 48px rgba(191,0,0,0.28)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Drawer slide-up. */
export const drawerVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: easeOut },
  exit: { y: '100%', transition: easeSnappy },
};

/** Modal scale-in. */
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: easeOut },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: easeSnappy },
};
