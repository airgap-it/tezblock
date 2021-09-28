import { getRewardAmountMinusFee, getRightStatus } from './reward';

describe('reward', () => {
  it('getRewardAmountMinusFee: withdraw percent based on tezosBakerFee', () => {
    const rewardAmont = 1000;
    const tezosBakerFee = 25;

    expect(getRewardAmountMinusFee(rewardAmont, tezosBakerFee)).toBe(750);
  });

  describe('getRightStatus', () => {
    it('when cycle > currentCycle then returns "Upcoming"', () => {
      expect(getRightStatus(50, 100)).toBe('Upcoming');
    });

    it('when cycle === currentCycle then returns "Active"', () => {
      expect(getRightStatus(100, 100)).toBe('Active');
    });

    it('when cycle < currentCycle - 5 then returns "Unfrozen"', () => {
      expect(getRightStatus(100, 50)).toBe('Unfrozen');
    });

    it('otherwise returns "Frozen"', () => {
      expect(getRightStatus(100, 99)).toBe('Frozen');
    });
  });
});
