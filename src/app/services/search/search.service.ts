import { Block } from './../../interfaces/Block'
import { TransactionSingleService } from './../transaction-single/transaction-single.service'
import { ApiService } from './../api/api.service'
import { AccountSingleService } from './../account-single/account-single.service'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BlockService } from '../blocks/blocks.service'
import { BlockSingleService } from '../block-single/block-single.service'
import { Observable } from 'rxjs'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private readonly blockService: BlockService, private readonly apiService: ApiService, private readonly router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false
  }

  public search(searchTerm: string) {
    // TODO: Very hacky, we need to do that better once we know if we build our own API endpoint or conseil will add something.
    let trimmedSearchTerm = searchTerm.trim()

    // if we typed in an alias, we should convert this into an address
    Object.keys(accounts).forEach(address => {
      if (accounts[address].alias === trimmedSearchTerm) {
        trimmedSearchTerm = address
      }
    })

    let found = false
    let counter = 0
    const max = 7

    const processResult = (result, callback: any) => {
      // TODO: any
      if (found) {
        return
      }
      counter++
      if (result.length > 0) {
        found = true
        callback(result)
      } else if (counter === max) {
        alert('No results found!')
      }
    }

    const accountSingleService = new AccountSingleService(this.apiService)
    const account$ = accountSingleService.account$
    accountSingleService.setAddress(trimmedSearchTerm)

    account$.subscribe(account => {
      if (account) {
        processResult([account], () => {
          this.router.navigateByUrl('/account/' + trimmedSearchTerm)
        })
      }
    })

    const transactionSingleService = new TransactionSingleService(this.apiService)
    const transactions$ = transactionSingleService.transactions$
    transactionSingleService.updateTransactionHash(trimmedSearchTerm)

    transactions$.subscribe(transactions => {
      if (transactions) {
        processResult(transactions, () => {
          this.router.navigateByUrl('/transaction/' + trimmedSearchTerm)
        })
      }
    })

    const blockSingleService = new BlockSingleService(this.blockService)
    const blocks$: Observable<Block[]> = blockSingleService.block$
    blockSingleService.updateHash(trimmedSearchTerm)

    blocks$.subscribe(blocks => {
      if (blocks) {
        processResult(blocks, () => {
          this.router.navigateByUrl('/block/' + blocks[0].level)
        })
      }
    })
  }
}
