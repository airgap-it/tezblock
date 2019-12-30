import { Injectable } from '@angular/core'
import { combineLatest, merge, Observable, of, timer } from 'rxjs'
import { distinctUntilChanged, map, switchMap, filter } from 'rxjs/operators'

import { Transaction } from '../../interfaces/Transaction'
import { ApiService } from '../api/api.service'
import { distinctPagination, distinctTransactionArray, distinctString, Facade, Pagination, refreshRate } from '../facade/facade'
import { LayoutPages } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { NewTransactionService } from '../transaction/new-transaction.service'
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters'

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

  // TODO: getAllTransactionsByAddress needs to be redone. As of now, in case of delegations, the index value delegatedBalance
  // is not assigned at runtime and therefore we need to make use of setTimeout
  download(layoutPage: string = 'account', limit: number = 100) {
    console.log('downloading')
    if (layoutPage === 'account') {
      this.transactionService.getAllTransactionsByAddress(this._state.address, this._state.kind, limit).subscribe(transactions => {
        setTimeout(() => {
          let data = transactions
          let csvData = this.ConvertToCSV(data)
          let a = document.createElement('a')
          a.setAttribute('style', 'display:none;')
          document.body.appendChild(a)
          let blob = new Blob([csvData], { type: 'text/csv' })
          let url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = this._state.kind + '.csv'
          a.click()
        }, 1000)
      })
    } else if (layoutPage === 'block') {
      this.apiService.getTransactionsByField(this._state.block, 'block_hash', this._state.kind, limit).subscribe(transactions => {
        setTimeout(() => {
          let data = transactions
          let csvData = this.ConvertToCSV(data)
          let a = document.createElement('a')
          a.setAttribute('style', 'display:none;')
          document.body.appendChild(a)
          let blob = new Blob([csvData], { type: 'text/csv' })
          let url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = this._state.kind + '.csv'
          a.click()
        }, 1000)
      })
    } else if (layoutPage === 'transaction') {
      this.apiService.getTransactionsById(this._state.hash, limit).subscribe(transactions => {
        setTimeout(() => {
          let data = transactions
          let csvData = this.ConvertToCSV(data)
          let a = document.createElement('a')
          a.setAttribute('style', 'display:none;')
          document.body.appendChild(a)
          let blob = new Blob([csvData], { type: 'text/csv' })
          let url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = this._state.kind + '.csv'
          a.click()
        }, 1000)
      })
    }
  }

  private ConvertToCSV(objArray: any): string {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray
    let str = ''
    let row = ''
    let indexTable: string[] = []

    for (let index in objArray[0]) {
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
    console.log('index table: ', indexTable)
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
      // for (const index in indexTable) {
      //   console.log('index: ', indexTable)
      //   if (line != '') {
      //     line += ','
      //   }
      //   console.log('array i index: ', array[i])
      //   line += array[i][index]
      // }
      str += line + '\r\n'
    }

    return str
  }
}
