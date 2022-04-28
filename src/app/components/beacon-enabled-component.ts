import { AccountInfo } from '@airgap/beacon-sdk';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getConnectedWallet } from '@tezblock/app.selectors';
import * as fromRoot from '@tezblock/reducers';
import { Observable } from 'rxjs';
import * as actions from '../app.actions';
import { BaseComponent } from './base.component';

@Component({
  template: '',
})
export abstract class BeaconEnabledComponent extends BaseComponent {
  connectedWallet$: Observable<AccountInfo | undefined>;

  constructor(protected readonly store$: Store<fromRoot.State>) {
    super();
  }

  ngOnInit(): void {
    this.store$.dispatch(actions.setupBeacon());
    this.connectedWallet$ = this.store$.select(getConnectedWallet);
  }

  connectWallet() {
    this.store$.dispatch(actions.connectWallet());
  }

  disconnectWallet() {
    this.store$.dispatch(actions.disconnectWallet());
  }
}
