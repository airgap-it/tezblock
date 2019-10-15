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
  originatedAccounts: Account[]
  loading: boolean
}

const initalState: AccountSingleServiceState = {
  address: '',
  account: undefined,
  delegatedAccounts: [],
  originatedAccounts: [],
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

  public originatedAccounts$ = this.state$.pipe(
    map(state => state.originatedAccounts),
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

  // TODO: Include into combineLatest
  // private getDelegatedAccounts(address: string): void {
  //   if (address) {
  //     if (address.startsWith('tz')) {
  //       this.apiService.getDelegatedAccounts(address, 10).subscribe((accounts: Account[]) => {
  //         const delegatedAccounts: Account[] = []
  //         const originatedAccounts: Account[] = []
  //         if (accounts.length === 0) {
  //           // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
  //           this.apiService.getAccountById(address).subscribe((accounts: Account[]) => {
  //             if (accounts[0].delegate) {
  //               delegatedAccounts.push(accounts[0])
  //               this.updateState({ ...this._state, delegatedAccounts, originatedAccounts, loading: false })
  //             }
  //           })
  //         } else {
  //           accounts.forEach(account => {
  //             if (account.account_id !== account.manager) {
  //               originatedAccounts.push(account)
  //             }
  //             if (account.delegate) {
  //               delegatedAccounts.push(account)
  //             }
  //           })
  //           this.updateState({ ...this._state, delegatedAccounts, originatedAccounts, loading: false })
  //         }
  //       })
  //     } else {
  //       this.apiService.getManagerAccount(address, 10).subscribe((managerAccounts: Account[]) => {
  //         const originAccounts: Account[] = []
  //         managerAccounts.forEach(account => {
  //           if (account.manager) {
  //             this.apiService.getAccountById(account.manager).subscribe((accounts: Account[]) => {
  //               if (accounts[0].account_id) {
  //                 originAccounts.push(accounts[0])
  //                 this.updateState({ ...this._state, originatedAccounts: originAccounts, loading: false })
  //               }
  //             })
  //           }
  //         })
  //       })
  //     }
  //   }
  // }
  private getDelegatedAccounts(address: string) {
    if (address) {
      this.apiService.getDelegatedAccounts(address, 10).subscribe((transactions: Transaction[]) => {
        const delegatedAccounts: Account[] = []
        let originatedAccounts: Account[] = []
        if (transactions.length === 0) {
          // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
          this.apiService.getAccountById(address).subscribe((accounts: Account[]) => {
            if (accounts[0].delegate) {
              delegatedAccounts.push(accounts[0])
              this.updateState({ ...this._state, delegatedAccounts, originatedAccounts, loading: false })
            }
          })
        } else {
          if (address.startsWith('tz')) {
            const tempList: string[] = []
            transactions.forEach(transaction => {
              if (!tempList.includes(transaction.originated_contracts)) {
                tempList.push(transaction.originated_contracts)
              }
            })
            this.apiService.getAccountsByIds(tempList).subscribe((accounts: Account[]) => {
              accounts.forEach(account => {
                if (account.delegate && !delegatedAccounts.includes(account)) {
                  delegatedAccounts.push(account)
                }
              })
              originatedAccounts = accounts
              this.updateState({ ...this._state, delegatedAccounts, originatedAccounts, loading: false })
            })
          } else {
            const tempList: string[] = []
            transactions.forEach(transaction => {
              if (!tempList.includes(transaction.manager_pubkey)) {
                tempList.push(transaction.manager_pubkey)
              }
            })
            this.apiService.getAccountsByIds(tempList).subscribe((accounts: Account[]) => {
              accounts.forEach(account => {
                if (account.delegate && !delegatedAccounts.includes(account)) {
                  delegatedAccounts.push(account)
                }
              })
              originatedAccounts = accounts
              this.updateState({ ...this._state, delegatedAccounts, originatedAccounts, loading: false })
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
