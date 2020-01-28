import { Injectable } from '@angular/core'
import { combineLatest, merge, Observable, of, timer } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'

import * as store from '@ngrx/store'
import * as fromRoot from '@tezblock/reducers'
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
  public transactions$ = this.state$.pipe(
    map(state => state.transactions),
    distinctUntilChanged(distinctTransactionArray)
  )
  public kind$ = this.state$.pipe(
    map(state => state.kind),
    distinctUntilChanged(distinctString)
  )
  public hash$ = this.state$.pipe(
    map(state => state.hash),
    distinctUntilChanged(distinctString)
  )
  public address$ = this.state$.pipe(
    map(state => state.address),
    distinctUntilChanged(distinctString)
  )
  public block$ = this.state$.pipe(
    map(state => state.block),
    distinctUntilChanged(distinctString)
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  public actionType$: Observable<LayoutPages>

  constructor(
    private readonly apiService: ApiService,
    private readonly transactionService: NewTransactionService,
    private readonly store$: store.Store<fromRoot.State>
  ) {
    super(initialState)

    const actions$ = [this.pagination$, this.hash$, this.kind$, this.address$, this.block$]
    const refreshAction$ = merge(of(-1), merge(...actions$).pipe(switchMap(() => timer(refreshRate, refreshRate))))
    const stream$ = combineLatest([this.pagination$, this.hash$, this.kind$, this.address$, this.block$, refreshAction$]).pipe(
      filter(([, hash, , address, block, _]) => !!hash || !!address || !!block)
    )

    this.actionType$ = stream$.pipe(
      map(([, hash, , address, block, _]) => {
        if (hash) {
          return LayoutPages.Transaction
        }

        if (address) {
          return LayoutPages.Account
        }

        if (block) {
          return LayoutPages.Block
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

  public updateAddress(address: string) {
    if (address !== this._state.address) {
      this.updateState({ ...this._state, address, hash: undefined, block: undefined, loading: true })
    }
  }

  public updateBlockHash(block: string) {
    if (block !== this._state.block) {
      this.updateState({ ...this._state, block, hash: undefined, address: undefined, loading: true })
    }
  }

  public updateTransactionHash(hash: string) {
    if (hash !== this._state.hash) {
      this.updateState({ ...this._state, hash, block: undefined, address: undefined, loading: true })
    }
  }

  public updateKind(kind: string) {
    if (kind !== this._state.kind) {
      this.updateState({ ...this._state, kind, loading: true })
    }
  }

  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }
    this.updateState({ ...this._state, pagination, loading: true })
  }

  // TODO: getAllTransactionsByAddress needs to be redone. As of now, in case of delegations, the index value delegatedBalance
  // is not assigned at runtime and therefore we need to make use of setTimeout
  public download(layoutPage: string = 'account', limit: number = 100) {
    const account$ = this.store$.select(state => state.accountDetails.account.account_id)
    const block$ = this.store$.select(state => state.blockDetails.transactionsLoadedByBlockHash)
    const hash$ = this.store$.select(state => state.transactionDetails.transactionHash)

    console.log('downloading')
    if (layoutPage === 'account') {
      account$.subscribe(account => {
        this.transactionService.getAllTransactionsByAddress(account, this._state.kind, limit).subscribe(transactions => {
          setTimeout(() => {
            const data = transactions
            const csvData = this.ConvertToCSV(data)
            const a = document.createElement('a')
            a.setAttribute('style', 'display:none;')
            document.body.appendChild(a)
            const blob = new Blob([csvData], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = this._state.kind + '.csv'
            a.click()
          }, 1000)
        })
      })
    } else if (layoutPage === 'block') {
      block$.subscribe(block => {
        this.apiService.getTransactionsByField(block, 'block_hash', this._state.kind, limit).subscribe(transactions => {
          setTimeout(() => {
            const data = transactions
            const csvData = this.ConvertToCSV(data)
            const a = document.createElement('a')
            a.setAttribute('style', 'display:none;')
            document.body.appendChild(a)
            const blob = new Blob([csvData], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = this._state.kind + '.csv'
            a.click()
          }, 1000)
        })
      })
    } else if (layoutPage === 'transaction') {
      hash$.subscribe(hash => {
        this.apiService.getTransactionsById(hash, limit).subscribe(transactions => {
          setTimeout(() => {
            const data = transactions
            const csvData = this.ConvertToCSV(data)
            const a = document.createElement('a')
            a.setAttribute('style', 'display:none;')
            document.body.appendChild(a)
            const blob = new Blob([csvData], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = this._state.kind + '.csv'
            a.click()
          }, 1000)
        })
      })
    }
  }

  private ConvertToCSV(objArray: any): string {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray
    let str = ''
    let row = ''
    const indexTable: string[] = []

    for (const index in objArray[0]) {
      if (
        index === 'source' ||
        index === 'destination' ||
        index === 'delegate' ||
        index === 'timestamp' ||
        index === 'amount' ||
        index === 'delegatedBalance' ||
        index === 'fee' ||
        index === 'block_level' ||
        index === 'operation_group_hash' ||
        index === 'gas_limit' ||
        index === 'storage_limit' ||
        index === 'parameters'
      ) {
        row += index + ','
        indexTable.push(index)
      }
    }
    row = row.slice(0, -1)
    str += row + '\r\n'

    for (let i = 0; i < array.length; i++) {
      let line = ''
      indexTable.forEach(index => {
        if (line != '') {
          line += ','
        }

        if (index === 'timestamp') {
          array[i][index] = new Date(array[i][index])
          line += array[i][index]
        } else {
          line += array[i][index]
        }
      })

      str += line + '\r\n'
    }

    return str
  }
}
