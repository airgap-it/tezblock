import { Injectable } from '@angular/core'
import { combineLatest, forkJoin, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { Account } from '../../interfaces/Account'
import { ApiService } from '../api/api.service'
import { Facade } from '../facade/facade'
import { Pagination } from '@tezblock/domain/table'
import { Transaction } from 'src/app/interfaces/Transaction'

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
        if (account.delegate) {
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

  public getFrozen(address: string): Promise<number> {
    return this.apiService.getFrozenBalance(address)
  }
}

export interface GetDelegatedAccountsResponseDto {
  delegated: Account[]
  related: Account[]
}

@Injectable({
  providedIn: 'root'
})
export class NewAccountService {
  constructor(private readonly apiService: ApiService) {}

  getDelegatedAccounts(
    address: string
  ): Observable<GetDelegatedAccountsResponseDto> {
    return this.apiService.getDelegatedAccounts(address, 10).pipe(
      switchMap((transactions: Transaction[]) => {
        if (transactions.length === 0) {
          // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
          return this.apiService.getAccountById(address).pipe(
            map((accounts: Account[]) => {
              const delegated = accounts.length > 0 && accounts[0].delegate_value ? [accounts[0]] : []

              return {
                delegated,
                related: []
              }
            })
          )
        }

        if (address.startsWith('tz')) {
          // since babylon, also tz addresses themselves can be delegated

          const originatedContracts = transactions.map(transaction => transaction.originated_contracts)

          return forkJoin(this.apiService.getAccountById(address), this.apiService.getAccountsByIds(originatedContracts)).pipe(
            map(([accounts, relatedAccounts]) => {
              const delegatedAccounts = accounts[0].delegate_value ? accounts : []

              return {
                delegated:
                  delegatedAccounts.length > 0
                    ? delegatedAccounts
                    : relatedAccounts.filter(relatedAccount => relatedAccount.delegate_value),
                related: relatedAccounts
              }
            })
          )
        }

        const managerPubKeys = transactions.map(transaction => transaction.manager_pubkey)

        return forkJoin(this.apiService.getAccountById(address), this.apiService.getAccountsByIds(managerPubKeys)).pipe(
          map(([accounts, relatedAccounts]) => {
            const delegated = accounts[0].delegate_value ? accounts : []

            return {
              delegated,
              related: relatedAccounts
            }
          })
        )
      })
    )
  }
}
