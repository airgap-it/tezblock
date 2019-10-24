import { Injectable } from '@angular/core'
import { combineLatest, forkJoin, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

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

    this.subscription = combineLatest([this.pagination$, this.hash$, this.kind$, this.address$, this.block$, this.timer$])
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

  private readonly kindToFieldsMap = {
    transaction: ['source', 'destination'],
    delegation: ['source', 'delegate'],
    origination: ['source'],
    endorsement: ['delegate'],
    ballot: ['source'],
    proposals: ['source']
  }

  private getAllTransactionsByAddress(address: string, kind: string, limit: number) {
    const fields = this.kindToFieldsMap[kind]
    const operations: Observable<Transaction[]>[] = []
    for (const field of fields) {
      operations.push(this.apiService.getTransactionsByField(address, field, kind, limit))
    }
    if (kind === 'delegation') {
      operations.push(this.apiService.getTransactionsByField(address, 'delegate', 'origination', limit))
    }
    if (kind === 'ballot') {
      const fields = this.kindToFieldsMap.proposals
      for (const field of fields) {
        operations.push(
          this.apiService.getTransactionsByField(address, field, 'proposals', limit).pipe(
            map(proposals => {
              proposals.forEach(proposal => (proposal.proposal = proposal.proposal.slice(1, proposal.proposal.length - 1)))

              return proposals
            })
          )
        )
      }
    }

    return forkJoin(operations).pipe(
      map(operation => {
        let transactions = operation.reduce((current, next) => current.concat(next))
        transactions.sort((a, b) => b.timestamp - a.timestamp)

        transactions = transactions.slice(0, limit)

        if (kind === 'delegation') {
          const sources: string[] = transactions.map(transaction => transaction.source)
          if (sources.length > 0) {
            const delegateSources = this.apiService.getAccountsByIds(sources)
            delegateSources.subscribe(delegators => {
              delegators.forEach(delegator => {
                const transaction = transactions.find(t => t.source === delegator.account_id)
                if (transaction !== undefined) {
                  transaction.delegatedBalance = delegator.balance
                }
              })
            })
          }
        }

        if (kind === 'ballot') {
          transactions.map(async transaction => this.apiService.addVotesForTransaction(transaction))
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
