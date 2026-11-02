import { useEffect } from 'react';
import { useDemo } from '@/app/DemoContext';

/**
 * Presenter keyboard shortcuts:
 *  P -> show / hide presenter controls
 *  T -> toggle "The 1 today" vs Dynamic Yield sorting
 *  L -> toggle the store-location signal (where the persona has one)
 */
export function useKeyboardShortcuts() {
  const { togglePresenter, sortMode, setSortMode, toggleLocation } = useDemo();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      switch (e.key.toLowerCase()) {
        case 'p':
          togglePresenter();
          break;
        case 't':
          setSortMode(sortMode === 'today' ? 'dy' : 'today');
          break;
        case 'l':
          toggleLocation();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePresenter, sortMode, setSortMode, toggleLocation]);
}
