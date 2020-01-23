import { Injectable } from '@angular/core'
import { combineLatest, merge, Observable, of, timer } from 'rxjs'
import { distinctUntilChanged, map, switchMap, filter } from 'rxjs/operators'

import { Transaction } from '../../interfaces/Transaction'
import { ApiService } from '../api/api.service'
import { distinctPagination, distinctTransactionArray, distinctString, Facade, Pagination, refreshRate } from '../facade/facade'
import { LayoutPages } from '@tezblock/domain/operations'
import { NewTransactionService } from '../transaction/new-transaction.service'

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
  transactions$ = this.state$.pipe(
    map(state => state.transactions),
    distinctUntilChanged(distinctTransactionArray)
  )
  kind$ = this.state$.pipe(
    map(state => state.kind),
    distinctUntilChanged(distinctString)
  )
  hash$ = this.state$.pipe(
    map(state => state.hash),
    distinctUntilChanged(distinctString)
  )
  address$ = this.state$.pipe(
    map(state => state.address),
    distinctUntilChanged(distinctString)
  )
  block$ = this.state$.pipe(
    map(state => state.block),
    distinctUntilChanged(distinctString)
  )
  pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  loading$ = this.state$.pipe(map(state => state.loading))

  actionType$: Observable<LayoutPages>

  constructor(private readonly apiService: ApiService, private readonly transactionService: NewTransactionService) {
    super(initialState)

    const actions$ = [this.pagination$, this.hash$, this.kind$, this.address$, this.block$]
    const refreshAction$ = merge(of(-1), merge(...actions$).pipe(switchMap(() => timer(refreshRate, refreshRate))))
    const stream$ = combineLatest([this.pagination$, this.hash$, this.kind$, this.address$, this.block$, refreshAction$]).pipe(
      filter(([pagination, hash, kind, address, block, _]) => !!hash || !!address || !!block)
    )

    this.actionType$ = stream$.pipe(
      map(([pagination, hash, kind, address, block, _]) => {
        if (hash) {
          return LayoutPages.Transaction
        }

        if (address) {
          return LayoutPages.Account
        }

        if (block) {
          LayoutPages.Block
        }

        return undefined
      })
    )

    this.subscription = stream$
      .pipe(
        switchMap(([pagination, hash, kind, address, block, _]) => {
          if (hash) {
            return this.apiService.getTransactionsById(hash, pagination.selectedSize * pagination.currentPage)
          }

          if (address) {
            return this.transactionService.getAllTransactionsByAddress(address, kind, pagination.selectedSize * pagination.currentPage)
          }

          if (block) {
            return this.apiService.getTransactionsByField(block, 'block_hash', kind, pagination.selectedSize * pagination.currentPage)
          }

          return of([])
        })
      )
      .subscribe(transactions => {
        this.updateState({ ...this._state, transactions, loading: false })
      })
  }

  updateAddress(address: string) {
    if (address !== this._state.address) {
      this.updateState({ ...this._state, address, hash: undefined, block: undefined, loading: true })
    }
  }

  updateBlockHash(block: string) {
    if (block !== this._state.block) {
      this.updateState({ ...this._state, block, hash: undefined, address: undefined, loading: true })
    }
  }

  updateTransactionHash(hash: string) {
    if (hash !== this._state.hash) {
      this.updateState({ ...this._state, hash, block: undefined, address: undefined, loading: true })
    }
  }

  updateKind(kind: string) {
    if (kind !== this._state.kind) {
      this.updateState({ ...this._state, kind, loading: true })
    }
  }

  loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }
    this.updateState({ ...this._state, pagination, loading: true })
  }
}
