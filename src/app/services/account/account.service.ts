import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { Account } from '../../interfaces/Account'
import { ApiService } from '../api/api.service'
import { Facade, Pagination } from '../facade/facade'
import { BalanceUpdate } from 'src/app/interfaces/BalanceUpdate'

interface AccountServiceState {
  accounts: Account[]
  pagination: Pagination
  loading: boolean
}

const initialState: AccountServiceState = {
  accounts: [],
  pagination: {
    currentPage: 1,
    selectedSize: 10,
    pageSizes: [5, 10, 20, 50]
  },
  loading: false
}

@Injectable({
  providedIn: 'root'
})
export class AccountService extends Facade<AccountServiceState> {
  public list$ = this.state$.pipe(
    map(state => state.accounts),
    distinctUntilChanged()
  )

  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged()
  )

  constructor(private readonly apiService: ApiService) {
    super(initialState)

    combineLatest([this.pagination$, this.timer$])
      .pipe(
        switchMap(([pagination, _]) => {
          return this.apiService.getLatestAccounts(pagination.selectedSize * pagination.currentPage)
        })
      )
      .subscribe(accounts => {
        this.updateState({ ...this._state, accounts, loading: false })
      })
  }

  public getAccountsStartingWith(id: string) {
    return this.apiService.getAccountsStartingWith(id)
  }

  /*
  public getDelegatedAccounts(tzAddress: string): void {
    this.apiService.getDelegatedAccounts(tzAddress).subscribe((accounts: Account[]) => {
      const delegatedAccounts: Account[] = []
      const relatedAccounts: Account[] = []
      accounts.forEach(account => {
        if (account.account_id !== account.manager) {
          relatedAccounts.push(account)
        }
        if (account.delegate_value) {
          delegatedAccounts.push(account)
        }
      })
      this.relatedAccountsSubject.next(relatedAccounts)
      this.delegatedAccountsSubject.next(delegatedAccounts)
    })
  }
  */

  public getAccountStatus(address: string): Promise<string> {
    return this.apiService.getAccountStatus(address)
  }

  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }

    this.updateState({ ...this._state, pagination, loading: true })
  }
  public getDepositsAndRewards(address: string, limit?: number): Promise<BalanceUpdate[]> {
    return this.apiService.getBalanceUpdates(address, limit)
  }
}
