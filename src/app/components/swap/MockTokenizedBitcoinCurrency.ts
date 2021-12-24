import BigNumber from 'bignumber.js';
import * as liquidityBakingCalculations from '../../services/liquidity-baking/liquidity-baking-calculations';
import { MockBaseCurrency } from './MockBaseCurrency';

export class MockTokenizedBitcoinCurrency extends MockBaseCurrency {
  private tokenPool: number = 13976257361;
  private xtzPool: number = 1594896201071;
  private lqtTotal: number = 146653221;

  public expectedXtzToTokenValues = [
    8.7e-7, 0.00000874, 0.00008745, 0.00087455, 0.00874503,
  ];
  public expectedTokenToXtzValues = [
    0.011388, 1.138866, 11.388593, 113.878608, 1138.054016,
  ];
  public expectedMinimumReceivedValues = [
    4.3e-7, 0.00000435, 0.0000435, 0.00043508, 0.00435079,
  ];
  public expectedLiquidityCreatedValues = [0, 4, 45, 457, 4574];
  public expectedXtzOutValues = [NaN, NaN, 0.010875, 0.108753, 1.08753];
  public expectedTokensOutValues = [NaN, NaN, 9.5e-7, 0.00000953, 0.0000953];

  constructor() {
    super();
  }

  async getExpectedMinimumReceivedToken(
    mutezAmount: BigNumber
  ): Promise<BigNumber> {
    const num = this.xtzToTokenTokenOutput(mutezAmount.toNumber());
    return new BigNumber(num).shiftedBy(-1 * this.decimals);
  }

  xtzToTokenTokenOutput(mutezAmount: number) {
    return liquidityBakingCalculations.xtzToTokenTokenOutput(
      mutezAmount,
      this.xtzPool,
      this.tokenPool
    );
  }

  async getExpectedMinimumReceivedTez(tokenAmount: number): Promise<BigNumber> {
    return new BigNumber(this.tokenToXtzXtzOutput(tokenAmount));
  }

  tokenToXtzXtzOutput(tokenAmount: number) {
    return liquidityBakingCalculations.tokenToXtzXtzOutput(
      tokenAmount,
      this.xtzPool,
      this.tokenPool
    );
  }

  async estimateLiquidityCreated(mutezAmount: BigNumber): Promise<BigNumber> {
    return new BigNumber(
      liquidityBakingCalculations.addLiquidityLiquidityCreated(
        mutezAmount.toNumber(),
        this.xtzPool,
        this.lqtTotal
      )
    );
  }

  async getLiquidityBurnXtzOut(lqtBurned: number): Promise<BigNumber> {
    return new BigNumber(
      liquidityBakingCalculations.removeLiquidityXtzOut(
        lqtBurned,
        this.lqtTotal,
        this.xtzPool
      )
    );
  }

  async getLiquidityBurnTokensOut(lqtBurned: number): Promise<BigNumber> {
    return new BigNumber(
      liquidityBakingCalculations.removeLiquidityTokenOut(
        lqtBurned,
        this.lqtTotal,
        this.tokenPool
      )
    );
  }

  async getAvailableLiquidityBalance(address: string): Promise<BigNumber> {
    return new BigNumber(108);
  }
}
