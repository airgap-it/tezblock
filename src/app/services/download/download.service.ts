import { Injectable } from '@angular/core'
import { Store }from '@ngrx/store'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'

import * as fromRoot from '@tezblock/reducers'
import { ApiService } from '../api/api.service'
import { TransactionService } from '../transaction/transaction.service'

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(
    private readonly store$: Store<fromRoot.State>,
    private readonly apiService: ApiService,
    private readonly newTransactionService: TransactionService,
    private readonly router: Router,
    private readonly toastrService: ToastrService
  ) {}

  download(layoutPage: string = 'account', limit: number = 100, kind: any) {
    const account$ = this.store$.select(state => state.accountDetails.account.account_id)
    const block$ = this.store$.select(state => state.blockDetails.transactionsLoadedByBlockHash)
    const hash$ = this.store$.select(state => state.transactionDetails.transactionHash)
    this.toastrService.show(
      '<div class="spinner-border spinner-border-sm d-inline-block" role="status"></div><span class="ml-3">Preparing Download</span>',
      '',
      {
        enableHtml: true
      }
    )

    if (layoutPage === 'account') {
      account$.subscribe(account => {
        this.newTransactionService.getAllTransactionsByAddress(account, kind, limit).subscribe(transactions => {
          setTimeout(() => {
            const data = transactions
            const csvData = this.ConvertToCSV(data)
            const a = document.createElement('a')
            a.setAttribute('style', 'display:none;')
            document.body.appendChild(a)
            const blob = new Blob([csvData], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = 'tezblock_' + kind + '_' + this.router.url.substring(1) + '.csv'
            a.click()
            this.toastrService.clear()
          }, 1000)
        })
      })
    } else if (layoutPage === 'block') {
      block$.subscribe(block => {
        this.apiService.getTransactionsByField(block, 'block_hash', kind, limit).subscribe(transactions => {
          setTimeout(() => {
            const data = transactions
            const csvData = this.ConvertToCSV(data)
            const a = document.createElement('a')
            a.setAttribute('style', 'display:none;')
            document.body.appendChild(a)
            const blob = new Blob([csvData], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = 'tezblock_' + kind + '_' + this.router.url.substring(1) + '.csv'
            a.click()
            this.toastrService.clear()
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
            a.download = 'tezblock_' + kind + '_' + this.router.url.substring(1) + '.csv'
            a.click()
            this.toastrService.clear()
          }, 1000)
        })
      })
    }
  }

  private ConvertToCSV(objArray: any): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
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
        index === 'originatedBalance' ||
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
        } else if (index === 'amount') {
          array[i][index] = array[i][index] / 1000000
          line += array[i][index]
        } else if (index === 'fee') {
          array[i][index] = array[i][index] / 1000000
          line += array[i][index]
        } else if (index === 'delegatedBalance') {
          array[i][index] = array[i][index] / 1000000
          line += array[i][index]
        } else if (index === 'originatedBalance') {
          array[i][index] = array[i][index] / 1000000
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
