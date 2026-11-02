import type { ComponentType } from 'react';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { BrandHubScreen } from './BrandHubScreen';
import { DetailScreen } from './DetailScreen';
import { CouponsScreen } from './CouponsScreen';
import { ChallengeScreen } from './ChallengeScreen';
import { RedeemScreen } from './RedeemScreen';
import { AccountScreen } from './AccountScreen';
import { MuseScreen } from './MuseScreen';

/** Chapter id → screen component. */
export const screenByChapter: Record<number, ComponentType> = {
  1: HomeScreen,
  2: SearchScreen,
  3: BrandHubScreen,
  4: DetailScreen,
  5: CouponsScreen,
  6: ChallengeScreen,
  7: RedeemScreen,
  8: AccountScreen,
  9: MuseScreen,
};
