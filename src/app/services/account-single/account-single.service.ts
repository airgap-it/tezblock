import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import { Account } from 'src/app/interfaces/Account'
import { ApiService } from '../api/api.service'
import { Facade, distinctAccounts } from '../facade/facade'
import { Delegation } from 'src/app/interfaces/Delegation'
import { Transaction } from 'src/app/interfaces/Transaction'

interface AccountSingleServiceState {
  address: string
  account: Account
  delegatedAccounts: Account[]
  relatedAccounts: Account[]
  loading: boolean
}

const initalState: AccountSingleServiceState = {
  address: '',
  account: undefined,
  delegatedAccounts: [],
  relatedAccounts: [],
  loading: false
}

@Injectable({
  providedIn: 'root'
})
export class AccountSingleService extends Facade<AccountSingleServiceState> {
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

  constructor(private readonly apiService: ApiService) {
    super(initalState)

    combineLatest([this.address$, this.timer$])
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
        const delegatedAccounts: Account[] = []
        let relatedAccounts: Account[] = []
        if (transactions.length === 0) {
          // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
          this.apiService.getAccountById(address).subscribe((accounts: Account[]) => {
            if (accounts[0].delegate) {
              delegatedAccounts.push(accounts[0])
              this.updateState({ ...this._state, delegatedAccounts, relatedAccounts, loading: false })
            }
          })
        } else {
          if (address.startsWith('tz')) {
            // since babylon, also tz addresses themselves can be delegated

            this.apiService.getAccountById(address).subscribe((accounts: Account[]) => {
              if (accounts[0].delegate) {
                this.updateState({ ...this._state, delegatedAccounts: accounts, relatedAccounts, loading: false })
              }
            })

            const originatedContracts = transactions.map(transaction => transaction.originated_contracts)
            this.apiService.getAccountsByIds(originatedContracts).subscribe((accounts: Account[]) => {
              console.log('accounts', accounts)
              accounts.forEach(account => {
                if (account.delegate && !delegatedAccounts.includes(account)) {
                  delegatedAccounts.push(account)
                }
              })
              relatedAccounts = accounts
              this.updateState({ ...this._state, delegatedAccounts, relatedAccounts, loading: false })
            })
          } else {
            this.apiService.getAccountById(address).subscribe((accounts: Account[]) => {
              if (accounts[0].delegate) {
                this.updateState({ ...this._state, delegatedAccounts: accounts, relatedAccounts, loading: false })
              }
            })

            const managerPubKeys = transactions.map(transaction => transaction.manager_pubkey)
            this.apiService.getAccountsByIds(managerPubKeys).subscribe((accounts: Account[]) => {
              relatedAccounts = accounts
              this.updateState({ ...this._state, delegatedAccounts, relatedAccounts, loading: false })
            })
          }
        }
      })
    }
  }

  public setAddress(address) {
    this.updateState({ ...this._state, address, loading: true })
  }
}
