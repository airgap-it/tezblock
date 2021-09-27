import { EMPTY } from 'rxjs';

export const getRewardServiceMock = () =>
  jasmine.createSpyObj('RewardService', {
    getLastCycles: EMPTY,
    getRewards: EMPTY,
    getRewardsPayouts: EMPTY,
    getRewardAmount: EMPTY,
    calculateRewards: EMPTY.toPromise(),
    getRewardsForAddressInCycle: EMPTY,
    getDoubleBakingEvidenceData: EMPTY,
    getDoubleEndorsingEvidenceData: EMPTY,
  });
