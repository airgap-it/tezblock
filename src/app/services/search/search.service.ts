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

const guessType = (token: string): OperationTypes => {
  if (token?.startsWith('o')) {
    return OperationTypes.Transaction
  }

  if (token?.toLowerCase().startsWith('b') || !isNaN(<any>token)) {
    return OperationTypes.Block
  }

  return OperationTypes.Account
}

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
    const _option: SearchOptionData = option.type ? option : { ...option, type: guessType(option.id) }

    if (_option.type === OperationTypes.TokenContract) {
      return this.router.navigateByUrl(`/contract/${_option.id}`)
    }

    if (_option.type === OperationTypes.Account || _option.type === OperationTypes.Baker) {
      return this.router.navigateByUrl(`/account/${_option.id}`)
    }

    if (_option.type === OperationTypes.Endorsement) {
      return this.router.navigateByUrl(`/endorsement/${_option.id}`)
    }

    if (_option.type === OperationTypes.Transaction) {
      return this.router.navigateByUrl(`/transaction/${_option.id}`)
    }

    // OperationTypes.Block
    return this.router.navigateByUrl(`/block/${_option.id}`)
  }

  getPreviousSearches(): Observable<SearchOptionData[]> {
    return this.cacheService.get<SearchOptionData[]>(CacheKeys.previousSearches).pipe(map(value => value || []))
  }

  updatePreviousSearches(option: SearchOptionData) {
    // to ommit optionGroup property
    const label = option.label && option.id !== option.label ? ['label'] : []
    const _option = <SearchOptionData>pick(option, ['id', 'type'].concat(label))

    this.cacheService.update(CacheKeys.previousSearches, (previousOptions: SearchOptionData[]) =>
      ((previousOptions || []).some(previousOption => previousOption.id === _option.id) ? [] : [_option])
        .concat(previousOptions || [])
        .slice(0, 5)
    )
  }
}
