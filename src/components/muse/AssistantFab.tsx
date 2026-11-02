import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';

/**
 * Floating assistant bubble (Shopping Muse). Sits above The 1's own
 * "Scan | Show QR" pill so the native control stays where members expect it.
 */
export function AssistantFab() {
  const { goToChapter } = useDemo();
  return (
    <motion.button
      type="button"
      onClick={() => goToChapter(chapterIdByKey('muse'))}
      aria-label="Open The 1 assistant"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.94 }}
      className="absolute bottom-[5.4rem] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-the1-black text-white shadow-float animate-pulseGlow"
    >
      <Icon name="auto_awesome" filled className="text-[22px]" />
    </motion.button>
  );
}
