import { Injectable } from '@angular/core'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { Transaction } from '../../interfaces/Transaction'
import { ApiService } from '../api/api.service'
import { distinctPagination, distinctTransactionArray, Facade, Pagination } from '../facade/facade'

interface TransactionServiceState {
  transactions: Transaction[]
  kind: string
  pagination: Pagination
  loading: boolean
}

const initialState: TransactionServiceState = {
  transactions: [],
  kind: 'transaction',
  pagination: {
    currentPage: 1,
    selectedSize: 6,
    pageSizes: [5, 10, 20, 50]
  },
  loading: true
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends Facade<TransactionServiceState> {
  public list$ = this.state$.pipe(
    map(state => state.transactions),
    distinctUntilChanged(distinctTransactionArray)
  )
  public kind$ = this.state$.pipe(
    map(state => state.kind),
    distinctUntilChanged()
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(private readonly apiService: ApiService) {
    super(initialState)

    combineLatest([this.pagination$, this.kind$, this.timer$])
      .pipe(
        switchMap(([pagination, kind, _]) => {
          return this.apiService.getLatestTransactions(pagination.selectedSize * pagination.currentPage, kind)
        })
      )
      .subscribe(transactions => {
        this.updateState({ ...this._state, transactions, loading: false })
      })
  }

  public updateKind(kind: string) {
    this.updateState({ ...this._state, kind, loading: true })
  }

  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }

    this.updateState({ ...this._state, pagination, loading: true })
  }

  public setPageSize(selectedSize: number) {
    const pagination = { ...this._state.pagination, selectedSize }
    this.updateState({ ...this._state, pagination, loading: true })
  }
}
