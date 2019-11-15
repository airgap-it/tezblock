import { Injectable, OnDestroy } from '@angular/core'
import { combineLatest, forkJoin, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import { Account } from 'src/app/interfaces/Account'
import { Transaction } from 'src/app/interfaces/Transaction'

import { ApiService } from '../api/api.service'
import { distinctAccounts, Facade } from '../facade/facade'

interface AccountSingleServiceState {
  address: string
  account: Account
  delegatedAccounts: Account[]
  relatedAccounts: Account[]
  loading: boolean
  activeDelegations: number | undefined
}

const initalState: AccountSingleServiceState = {
  address: '',
  account: undefined,
  delegatedAccounts: undefined,
  relatedAccounts: undefined,
  loading: true,
  activeDelegations: undefined
}

@Injectable({
  providedIn: 'root'
})
export class AccountSingleService extends Facade<AccountSingleServiceState> implements OnDestroy {
  public address$ = this.state$.pipe(
    map(state => state.address),
    distinctUntilChanged()
  )

  public account$ = this.state$.pipe(
    map(state => state.account),
    distinctUntilChanged()
  )

  public delegatedAccounts$ = this.state$.pipe(
    map(state => state.delegatedAccounts),
    distinctUntilChanged()
  )

  public relatedAccounts$ = this.state$.pipe(
    map(state => state.relatedAccounts),
    distinctUntilChanged(distinctAccounts)
  )

  public activeDelegations$ = this.state$.pipe(
    map(state => state.activeDelegations),
    distinctUntilChanged()
  )

  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(private readonly apiService: ApiService) {
    super(initalState)

    this.subscription = combineLatest([this.address$, this.timer$])
      .pipe(
        switchMap(([address, _]) => {
          return this.apiService.getDelegatedAccountsList(address)
        })
      )
      .subscribe(list => {
        this.updateState({ ...this._state, activeDelegations: list.length, loading: false })
      })

    this.subscription = combineLatest([this.address$, this.timer$])
      .pipe(
        switchMap(([address, _]) => {
          return this.getById(address)
        })
      )
      .subscribe(account => {
        this.updateState({ ...this._state, account, loading: false })
      })
  }

  private getById(id: string): Observable<Account> {
    this.getDelegatedAccounts(id)

    return this.apiService.getAccountById(id).pipe(map(accounts => accounts[0]))
  }

  private getDelegatedAccounts(address: string) {
    if (address) {
      this.apiService.getDelegatedAccounts(address, 10).subscribe((transactions: Transaction[]) => {
        if (transactions.length === 0) {
          // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
          this.apiService.getAccountById(address).subscribe((accounts: Account[]) => {
            const delegatedAccounts = accounts[0].delegate_value ? [accounts[0]] : []

            this.updateState({ ...this._state, delegatedAccounts, relatedAccounts: [], loading: false })
          })
        } else {
          if (address.startsWith('tz')) {
            // since babylon, also tz addresses themselves can be delegated

            const originatedContracts = transactions.map(transaction => transaction.originated_contracts)

            forkJoin(this.apiService.getAccountById(address), this.apiService.getAccountsByIds(originatedContracts)).subscribe(
              ([accounts, relatedAccounts]) => {
                const delegatedAccounts = accounts[0].delegate_value ? accounts : []

                this.updateState({
                  ...this._state,
                  delegatedAccounts: delegatedAccounts.length > 0
                    ? delegatedAccounts
                    : relatedAccounts.filter(relatedAccount => relatedAccount.delegate_value),
                  relatedAccounts,
                  loading: false
                })
              }
            )
          } else {
            const managerPubKeys = transactions.map(transaction => transaction.manager_pubkey)

            forkJoin(this.apiService.getAccountById(address), this.apiService.getAccountsByIds(managerPubKeys)).subscribe(
              ([accounts, relatedAccounts]) => {
                const delegatedAccounts = accounts[0].delegate_value ? accounts : []

                this.updateState({
                  ...this._state,
                  delegatedAccounts,
                  relatedAccounts,
                  loading: false
                })
              }
            )
          }
        }
      })
    }
  }

  public setAddress(address) {
    this.updateState({ ...this._state, address, loading: true })
  }
}

//        })
//       } else {
//   this.apiService.getManagerAccount(address, 10).subscribe((managerAccounts: Account[]) => {
//     const originAccounts: Account[] = []
//     const delegatedAccounts: Account[] = []
//     if (managerAccounts[0].delegate_value) {
//       delegatedAccounts.push(managerAccounts[0])
//     }
//     managerAccounts.forEach(account => {
//       if (account.manager) {
//         this.apiService.getAccountById(account.manager).subscribe((accounts: Account[]) => {
//           if (accounts[0].account_id) {
//             originAccounts.push(accounts[0])
//             this.updateState({
//               ...this._state,
//               delegatedAccounts: delegatedAccounts,
//               originatedAccounts: originAccounts,
//               loading: false
//             })
//           }
//         })
//       }
//     })
//   })
// }
