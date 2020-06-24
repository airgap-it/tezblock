import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { merge, Observable, Subject, Subscription } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import { StorageMap } from '@ngx-pwa/local-storage'
import { negate, isNil } from 'lodash'

import { ApiService } from './../api/api.service'
import { AccountService } from '@tezblock/services/account/account.service'
import { first } from '@tezblock/services/fp'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { getTokenContractBy } from '@tezblock/domain/contract'
import { SearchOptionType } from './model'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

const accounts = require('../../../assets/bakers/json/accounts.json')
const previousSearchesKey = 'previousSearches'

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(
    private readonly accountService: AccountService,
    private readonly apiService: ApiService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly router: Router,
    private readonly storage: StorageMap
  ) {}

  // TODO: now contract is looked first, is it OK (what if searchTerm matches account and contract ?)
  processSearchSelection(searchTerm: string, type?: string): Observable<boolean> {
    const subscriptions: Subscription[] = []
    const unsubscribe = () => subscriptions.forEach(subscription => subscription.unsubscribe())
    const trimmedSearchTerm = searchTerm.trim()
    const result = new Subject<boolean>()

    // if we typed in an alias, we should convert this into an address
    const getAllies = (term: string) => Object.keys(accounts).find(account => accounts[account].alias === term)

    const _searchTerm = getAllies(trimmedSearchTerm) || trimmedSearchTerm

    let found = false
    let counter = 0

    const processResult = (data: any, callback: Function): boolean => {
      if (found) {
        return false
      }

      counter++

      if (data) {
        found = true
        callback(data)
        result.next(true)
        result.complete()
        unsubscribe()

        return true
      }

      if (counter === 7) {
        result.next(false)
        result.complete()
        unsubscribe()
        alert('No results found!')
      }

      return false
    }

    // TODO: implement full search by contract
    const contract = getTokenContractBy(trimmedSearchTerm, this.chainNetworkService.getNetwork())
    if (contract && (!type || type === SearchOptionType.faContract)) {
      processResult([contract], () => this.router.navigateByUrl('/contract/' + contract.id))
    } else {
      subscriptions.push(
        this.accountService
          .getAccountById(_searchTerm)
          .pipe(filter(negate(isNil)))
          .subscribe(account => processResult(account, () => this.router.navigateByUrl('/account/' + _searchTerm))),
        this.apiService
          .getTransactionsById(_searchTerm, 1)
          .pipe(map(first), filter(negate(isNil)))
          .subscribe(transaction =>
            processResult(transaction, (transaction: Transaction) => {
              if (transaction.kind === 'endorsement') {
                this.router.navigateByUrl('/endorsement/' + _searchTerm)

                return
              }

              this.router.navigateByUrl('/transaction/' + _searchTerm)
            })
          ),
        merge(this.apiService.getBlockByHash(_searchTerm), this.apiService.getBlockByLevel(_searchTerm))
          .pipe(filter(negate(isNil)))
          .subscribe(block => processResult(block, () => this.router.navigateByUrl('/block/' + block.level)))
      )
    }

    return result
  }

  getPreviousSearches(): Observable<string[]> {
    return this.storage.get(previousSearchesKey).pipe(map(previousSearches => previousSearches || [])) as Observable<string[]>
  }

  updatePreviousSearches(searchTerm) {
    return this.getPreviousSearches()
      .pipe(
        map((previousSearches: string[]) =>
          (previousSearches.indexOf(searchTerm) === -1 ? [searchTerm] : []).concat(previousSearches).slice(0, 5)
        ),
        switchMap((updatedPreviousSearches: string[]) => this.storage.set(previousSearchesKey, updatedPreviousSearches))
      )
      .subscribe(() => {})
  }
}
