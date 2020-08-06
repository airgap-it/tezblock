import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import { pick } from 'lodash'

import { ApiService } from './../api/api.service'
import { AccountService } from '@tezblock/services/account/account.service'
import { searchTokenContracts } from '@tezblock/domain/contract'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { OperationTypes } from '@tezblock/domain/operations'
import { CacheKeys, CacheService } from '@tezblock/services/cache/cache.service'
import { SearchOptionData } from './model'

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(
    private readonly accountService: AccountService,
    private readonly apiService: ApiService,
    private readonly cacheService: CacheService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly router: Router
  ) {}

  getSearchSources(token: string): Observable<SearchOptionData[]>[] {
    const matchByAccountIds = ['tz', 'KT', 'SG'].some(prefix => token?.startsWith(prefix))
    const result = [
      of(searchTokenContracts(token, this.chainNetworkService.getNetwork())),
      this.accountService.getAccountsStartingWith(token, matchByAccountIds)
    ]

    if (token?.startsWith('o')) {
      result.push(this.apiService.getTransactionHashesStartingWith(token))
    }

    if (token?.startsWith('b') || token?.startsWith('B')) {
      result.push(this.apiService.getBlockHashesStartingWith(token))
    }

    if (!isNaN(<any>token)) {
      result.push(
        this.apiService
          .getBlockByLevel(token)
          .pipe(map(block => (block ? [{ id: block.level.toString(), type: OperationTypes.Block }] : [])))
      )
    }

    return result
  }

  // TODO: now contract is looked first, is it OK (what if searchTerm matches account and contract ?)
  processSearchSelection(option: SearchOptionData) {
    if (option.type === OperationTypes.TokenContract) {
      return this.router.navigateByUrl(`/contract/${option.id}`)
    }

    if (option.type === OperationTypes.Account || option.type === OperationTypes.Baker) {
      return this.router.navigateByUrl(`/account/${option.id}`)
    }

    if (option.type === OperationTypes.Endorsement) {
      return this.router.navigateByUrl(`/endorsement/${option.id}`)
    }

    if (option.type === OperationTypes.Transaction) {
      return this.router.navigateByUrl(`/transaction/${option.id}`)
    }
    
    // OperationTypes.Block
    return this.router.navigateByUrl(`/block/${option.id}`)
  }

  getPreviousSearches(): Observable<SearchOptionData[]> {
    return this.cacheService.get<SearchOptionData[]>(CacheKeys.previousSearches).pipe(map(value => value || []))
  }

  updatePreviousSearches(option: SearchOptionData) {
    // to ommit optionGroup property
    const _option = pick(option, ['id', 'label', 'type'])

    this.cacheService.update(CacheKeys.previousSearches, (previousOptions: SearchOptionData[]) =>
      ((previousOptions || []).some(previousOption => previousOption.id === _option.id) ? [] : [_option])
        .concat(previousOptions || [])
        .slice(0, 5)
    )
  }
}
