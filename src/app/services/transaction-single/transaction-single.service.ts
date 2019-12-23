import { Injectable } from '@angular/core'
import { combineLatest, forkJoin, merge, Observable, of, timer } from 'rxjs'
import { distinctUntilChanged, map, switchMap, filter } from 'rxjs/operators'

import { Transaction } from '../../interfaces/Transaction'
import { ApiService } from '../api/api.service'
import { distinctPagination, distinctTransactionArray, distinctString, Facade, Pagination, refreshRate } from '../facade/facade'
import { LayoutPages } from '@tezblock/components/tezblock-table/tezblock-table.component'

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

  constructor(private readonly apiService: ApiService) {
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
            return this.getAllTransactionsByAddress(address, kind, pagination.selectedSize * pagination.currentPage)
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
        if (kind === 'origination') {
          const originatedSources: string[] = transactions.map(transaction => transaction.originated_contracts)

          if (originatedSources.length > 0) {
            const originatedAccounts = this.apiService.getAccountsByIds(originatedSources)
            originatedAccounts.subscribe(originators => {
              originators.forEach(originator => {
                const transaction = transactions.find(t => t.originated_contracts === originator.account_id)
                if (transaction !== undefined) {
                  transaction.originatedBalance = originator.balance
                }
              })
            })
          }
        }

        if (kind === 'ballot') {
          transactions.map(async transaction => {
            this.apiService.getVotingPeriod(transaction.block_level).subscribe(period => (transaction.voting_period = period))
            this.apiService.addVotesForTransaction(transaction)
          })
        }

        return transactions
      })
    )
  }

  loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }
    this.updateState({ ...this._state, pagination, loading: true })
  }
  download(layoutPage: string = 'account', limit: number = 100) {
    console.log('downloading')
    if (layoutPage === 'account') {
      this.getAllTransactionsByAddress(this._state.address, this._state.kind, limit).subscribe(transactions => {
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
      })
    } else if (layoutPage === 'block') {
      this.apiService.getTransactionsByField(this._state.block, 'block_hash', this._state.kind, limit).subscribe(transactions => {
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
      })
    } else if (layoutPage === 'transaction') {
      this.apiService.getTransactionsById(this._state.hash, limit).subscribe(transactions => {
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
      })
    }
  }

  private ConvertToCSV(objArray: any): string {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray
    let str = ''
    let row = ''

    for (let index in objArray[0]) {
      row += index + ','
    }
    row = row.slice(0, -1)
    str += row + '\r\n'

    for (let i = 0; i < array.length; i++) {
      let line = ''
      for (const index in array[i]) {
        if (line != '') {
          line += ','
        }

        line += array[i][index]
      }
      str += line + '\r\n'
    }

    return str
  }
}
