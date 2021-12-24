import { AccountInfo } from '@airgap/beacon-sdk';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { getSelectedSlippage } from '@tezblock/app.selectors';
import * as fromRoot from '@tezblock/reducers';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as actions from '../../app.actions';
import { AbstractCurrency } from '../swap/swap-utils';

@Component({
  template: '',
})
export abstract class LiquidityBaseComponent {
  @Input()
  public connectedWallet$: Observable<AccountInfo | undefined>;
  @Input()
  public fromCurrency: AbstractCurrency | undefined;
  @Input()
  public toCurrency: AbstractCurrency | undefined;
  @Input()
  public availableBalanceFrom$: Observable<BigNumber | undefined>;
  @Input()
  public availableBalanceTo$: Observable<BigNumber | undefined>;

  public slippages: number[] = [0.5, 1, 3];
  public fromDecimals: number = 0;
  public toDecimals: number = 0;
  public address: string;
  public busy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadValuesBusy$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public selectedSlippage$: ReplaySubject<number> = new ReplaySubject(1);
  public minimumReceived$: BehaviorSubject<BigNumber | undefined> =
    new BehaviorSubject(undefined);

  protected readonly ngDestroyed$: Subject<void> = new Subject();

  constructor(protected readonly store$: Store<fromRoot.State>) {}

  async ngOnInit() {
    this.store$
      .select(getSelectedSlippage)
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((slippage) => {
        this.selectedSlippage$.next(slippage);
      });
  }

  connectWallet() {
    this.store$.dispatch(actions.connectWallet());
  }

  setSlippage(slippage: number) {
    this.store$.dispatch(actions.setSlippage({ slippage }));
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
