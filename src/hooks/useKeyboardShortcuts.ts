import { useEffect } from 'react';
import { useDemo } from '@/app/DemoContext';

/**
 * Presenter keyboard shortcuts:
 *  P -> show / hide presenter controls
 *  T -> toggle "The 1 today" vs Dynamic Yield sorting
 */
export function useKeyboardShortcuts() {
  const { togglePresenter, sortMode, setSortMode } = useDemo();

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
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePresenter, sortMode, setSortMode]);
}
