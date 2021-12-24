import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { Validators } from '@angular/forms';
import { PartialTezosOperation } from '@airgap/beacon-sdk';

export const formControlOptions = [
  Validators.min(0),
  Validators.required,
  Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
];
export interface AbstractCurrency {
  symbol: string;
  chartSymbol: string;
  liquidityTokenSymbol: string | undefined;
  decimals: number;
  imgUrl: string;

  getBalance(): Observable<BigNumber | undefined>;

  fromTez(
    address: string,
    amount: BigNumber,
    minTokenAmount: number
  ): Promise<PartialTezosOperation[]>;
  toTez(
    address: string,
    amount: BigNumber,
    minTokenAmount: number
  ): Promise<PartialTezosOperation[]>;

  addLiquidity(
    mutezAmount: number,
    address: string,
    minLqtMinted: number,
    expectedTokenAmount: number
  ): Promise<PartialTezosOperation[]>;

  addLiquidityManually(
    address: string,
    minLqtMinted: number,
    maxTokenDeposited: number
  ): Promise<PartialTezosOperation[]>;

  removeLiquidity(
    liquidityAmount: number,
    address: string
  ): Promise<PartialTezosOperation[]>;

  getAvailableLiquidityBalance(address: string): Promise<BigNumber>;
  getLiquidityBurnXtzOut(lqtBurned: number): Promise<BigNumber>;
  getLiquidityBurnTokensOut(lqtBurned: number): Promise<BigNumber>;
  estimateLiquidityCreated(mutezAmount: BigNumber): Promise<BigNumber>;
  getExpectedMinimumReceivedToken(mutezAmount: BigNumber): Promise<BigNumber>;
  getExpectedMinimumReceivedTez(
    tokenAmount: number,
    tokenCurrency?: AbstractCurrency
  ): Promise<BigNumber>;

  getTotalValueLocked(): Observable<string>;
  estimateApy(): Observable<string>;
}

export const tezToMutez = (
  tez: BigNumber | number | undefined,
  decimals: number | undefined,
  round: boolean = true
): number => {
  if (decimals === undefined) {
    throw new Error('Decimals not defined');
  }
  if (!tez) {
    return 0;
  }

  const amount = new BigNumber(tez).shiftedBy(decimals).toNumber();
  return round ? Math.round(amount) : amount;
};
