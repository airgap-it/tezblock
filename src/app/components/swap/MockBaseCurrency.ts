import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { AbstractCurrency } from './swap-utils';
import { PartialTezosOperation } from '@airgap/beacon-sdk';

export abstract class MockBaseCurrency implements AbstractCurrency {
  public symbol = 'symbol';
  public referenceSymbol = 'referenceSymbol';
  public chartSymbol = this.symbol;
  public liquidityTokenSymbol = 'liquidityTokenSymbol';
  public decimals = 8;
  public imgUrl = '';
  public tezAmounts = [0.01, 0.1, 1, 10, 100];
  public tokenToTezAmounts = [0.000001, 0.0001, 0.001, 0.01, 0.1];

  constructor() {}

  getExpectedMinimumReceivedToken(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  async getExpectedMinimumReceivedTez(
    _tokenAmount: number
  ): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  getBalance(): Observable<BigNumber | undefined> {
    throw new Error('Not implemented');
  }

  fromTez(
    _address: string,
    _amount: BigNumber,
    _minTokenAmount: number
  ): Promise<PartialTezosOperation[]> {
    throw new Error('Not implemented');
  }

  toTez(
    _address: string,
    _amount: BigNumber,
    _minTokenAmount: number
  ): Promise<PartialTezosOperation[]> {
    throw new Error('Not implemented');
  }

  getExpectedTokenIn(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  addLiquidity(
    _address: string,
    _mutezAmount: number,
    _maxTokenDeposited: number,
    _minLqtMinted: number
  ): Promise<PartialTezosOperation[]> {
    throw new Error('Not implemented');
  }

  addLiquidityManually(
    _address: string,
    _minLqtMinted: number,
    _maxTokenDeposited: number
  ): Promise<PartialTezosOperation[]> {
    throw new Error('Not implemented');
  }

  removeLiquidity(
    _address: string,
    _liquidityAmount: number,
    _minTokensWithdrawn: number
  ): Promise<PartialTezosOperation[]> {
    throw new Error('Not implemented');
  }

  getLiquidityBurnXtzOut(_lqtBurned: number): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  getLiquidityBurnTokensOut(_lqtBurned: number): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  getAvailableLiquidityBalance(_address: string): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  estimatePriceImpact(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  estimateLiquidityCreated(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  getTotalValueLocked(): Observable<string> {
    throw new Error('Not implemented');
  }

  estimateApy(): Observable<string> {
    throw new Error('Not implemented');
  }
}
