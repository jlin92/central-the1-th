import { useDemo } from '@/app/DemoContext';
import { chapterById, chapterIdByKey } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/hooks/utils';

interface Tab {
  label: string;
  icon: string;
  chapter: number;
  /** Chapters highlighted under this tab. */
  keys: string[];
}

/** The four The 1 tabs, exactly as in the live app. */
const tabs: Tab[] = [
  { label: 'Home', icon: 'home', chapter: 1, keys: ['home', 'brand', 'coupons', 'muse'] },
  { label: 'Search', icon: 'search', chapter: chapterIdByKey('search'), keys: ['search', 'detail'] },
  { label: 'Challenge', icon: 'flag', chapter: chapterIdByKey('challenge'), keys: ['challenge'] },
  { label: 'Account', icon: 'account_circle', chapter: chapterIdByKey('account'), keys: ['account', 'redeem'] },
];

/** Bottom tab bar with the red active indicator line from the live app. */
export function BottomNav() {
  const { chapter, goToChapter } = useDemo();
  const key = chapterById(chapter).key;

  return (
    <nav aria-label="Primary" className="relative z-30 border-t border-surface-container-high bg-white px-2 pb-5 pt-1">
      <ul className="flex items-end justify-between">
        {tabs.map((tab) => {
          const active = tab.keys.includes(key);
          return (
            <li key={tab.label} className="flex-1">
              <button type="button" onClick={() => goToChapter(tab.chapter)} aria-current={active ? 'page' : undefined} className={cn('relative flex w-full flex-col items-center gap-0.5 px-1 py-1', active ? 'text-on-surface' : 'text-on-surface-variant')}>
                {active && <span className="absolute -top-1 h-0.5 w-8 rounded-full bg-primary" />}
                <Icon name={tab.icon} filled={active} className="text-[26px]" />
                <span className={cn('text-[11px]', active ? 'font-semibold' : 'font-normal')}>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
