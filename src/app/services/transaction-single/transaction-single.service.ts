import { Injectable } from '@angular/core'
import { combineLatest, forkJoin, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import axios, { AxiosResponse } from 'axios'

import { Transaction } from '../../interfaces/Transaction'
import { ApiService } from '../api/api.service'
import { distinctPagination, distinctTransactionArray, Facade, Pagination } from '../facade/facade'

interface TransactionSingleServiceState {
  transactions: Transaction[]
  hash: string | undefined
  address: string | undefined
  block: string | undefined
  kind: string
  pagination: Pagination
  loading: boolean
}

export interface VotingInfo {
  pkh: string
  rolls: number
}

const initialState: TransactionSingleServiceState = {
  transactions: [],
  kind: 'transaction',
  hash: '',
  address: '',
  block: '',
  pagination: {
    currentPage: 1,
    selectedSize: 10,
    pageSizes: [5, 10, 20, 50]
  },
  loading: true
}

@Injectable({
  providedIn: 'root'
})
export class TransactionSingleService extends Facade<TransactionSingleServiceState> {
  public transactions$ = this.state$.pipe(
    map(state => state.transactions),
    distinctUntilChanged(distinctTransactionArray)
  )
  public kind$ = this.state$.pipe(
    map(state => state.kind),
    distinctUntilChanged()
  )
  public hash$ = this.state$.pipe(
    map(state => state.hash),
    distinctUntilChanged()
  )
  public address$ = this.state$.pipe(
    map(state => state.address),
    distinctUntilChanged()
  )
  public block$ = this.state$.pipe(
    map(state => state.block),
    distinctUntilChanged()
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(private readonly apiService: ApiService) {
    super(initialState)

    combineLatest([this.pagination$, this.hash$, this.kind$, this.address$, this.block$, this.timer$])
      .pipe(
        switchMap(([pagination, hash, kind, address, block, _]) => {
          if (hash) {
            return this.apiService.getTransactionsById(hash, pagination.selectedSize * pagination.currentPage)
          } else if (address) {
            return this.getAllTransactionsByAddress(address, kind, pagination.selectedSize * pagination.currentPage)
          } else if (block) {
            return this.apiService.getTransactionsByField(block, 'block_hash', kind, pagination.selectedSize * pagination.currentPage)
          } else {
            return new Observable<Transaction[]>(observer => {
              observer.next([])
              observer.complete()
            })
          }
        })
      )
      .subscribe(transactions => {
        this.updateState({ ...this._state, transactions, loading: false })
      })
  }

  public updateAddress(address: string) {
    this.updateState({ ...this._state, address, hash: undefined, block: undefined, loading: true })
  }

  public updateBlockHash(block: string) {
    this.updateState({ ...this._state, block, hash: undefined, address: undefined, loading: true })
  }

  public updateTransactionHash(hash: string) {
    this.updateState({ ...this._state, hash, block: undefined, address: undefined, loading: true })
  }

  public updateKind(kind: string) {
    this.updateState({ ...this._state, kind, loading: true })
  }

  private getAllTransactionsByAddress(address: string, kind: string, limit: number) {
    let combinedSource = this.apiService.getTransactionsByField(address, 'source', kind, limit)
    if (kind === 'ballot') {
      combinedSource = forkJoin([
        this.apiService.getTransactionsByField(address, 'source', kind, limit),
        this.apiService.getTransactionsByField(address, 'source', 'proposals', limit)
      ]).pipe(
        map(([ballots, proposals]) => {
          proposals.forEach(proposal => (proposal.proposal = proposal.proposal.slice(1).replace(']', '')))
          let source: Transaction[] = []
          source.push(...ballots, ...proposals)
          source.sort((a, b) => {
            return b.timestamp - a.timestamp
          })
          source.map(async transaction => {
            await this.apiService.addVotesForTransaction(transaction)
          })
          source = source.slice(0, limit)
          return source
        })
      )
    }
    return forkJoin([
      combinedSource,
      this.apiService.getTransactionsByField(address, 'destination', kind, limit),
      this.apiService.getTransactionsByField(address, 'delegate', kind, limit)
    ]).pipe(
      map(([from, to, delegate]) => {
        let transactions: Transaction[] = []
        transactions.push(...from, ...to, ...delegate)
        transactions.sort((a, b) => {
          return b.timestamp - a.timestamp
        })
        transactions = transactions.slice(0, limit)
        const sources = []

        transactions.forEach(transaction => {
          if (transaction.kind === 'delegation') {
            sources.push(transaction.source)
          }
        })
        if (sources.length > 0) {
          const delegateSources = this.apiService.getAccountsByIds(sources)
          delegateSources.subscribe(delegators => {
            transactions.forEach(transaction => {
              delegators.forEach(delegator => {
                if (transaction.source === delegator.account_id) {
                  transaction.delegatedBalance = delegator.balance
                }
              })
            })
          })
        }

        return transactions
      })
    )
  }

  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }
    this.updateState({ ...this._state, pagination, loading: true })
  }
}
