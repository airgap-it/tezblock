import BigNumber from 'bignumber.js';
import * as fromRoot from '@tezblock/reducers';
import * as actions from './../../app.actions';
import { Store } from '@ngrx/store';
import {
  getConnectedWallet,
  getConnectedWalletBalance,
} from '@tezblock/app.selectors';
import { switchMap } from 'rxjs/operators';
import { PartialTezosOperation } from '@airgap/beacon-sdk';
import { from, Observable } from 'rxjs';
import { AbstractCurrency } from './swap-utils';
import { Currency } from '@tezblock/domain/airgap';

export class TezosCurrency implements AbstractCurrency {
  public symbol = Currency.XTZ;
  public chartSymbol = 'ꜩ';
  public liquidityTokenSymbol = undefined;
  public decimals = 6;

  public imgUrl = '/assets/img/symbols/tez.svg';

  constructor(protected store$: Store<fromRoot.State>) {}

  getBalance() {
    return this.store$.select(getConnectedWallet).pipe(
      switchMap((accountInfo) => {
        this.store$.dispatch(actions.fetchConnectedWalletBalance());
        return accountInfo
          ? this.store$.select(getConnectedWalletBalance)
          : from([new BigNumber(0)]);
      })
    );
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
    _mutezAmount: number,
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

  getExpectedMinimumReceivedToken(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  getExpectedTokenIn(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  estimatePriceImpact(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  async estimateLiquidityCreated(_mutezAmount: BigNumber): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  async getExpectedMinimumReceivedTez(
    tokenAmount: number,
    tokenCurrency: AbstractCurrency
  ): Promise<BigNumber> {
    return tokenCurrency.getExpectedMinimumReceivedTez(tokenAmount);
  }

  getTotalValueLocked(): Observable<string> {
    throw new Error('Not implemented');
  }

  estimateApy(): Observable<string> {
    throw new Error('Not implemented');
  }
}
