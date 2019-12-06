import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ApiService } from '../api/api.service'
import { Transaction } from '../../interfaces/Transaction'

@Injectable({
  providedIn: 'root'
})
export class NewTransactionService {

  constructor(private readonly apiService: ApiService) { }

  getAllTransactionsByAddress(address: string, kind: string, limit: number) {
    const kindToFieldsMap = {
      transaction: ['source', 'destination'],
      delegation: ['source', 'delegate'],
      origination: ['source'],
      endorsement: ['delegate'],
      ballot: ['source'],
      proposals: ['source']
    }
    const fields = kindToFieldsMap[kind]
    const operations: Observable<Transaction[]>[] = []
    for (const field of fields) {
      operations.push(this.apiService.getTransactionsByField(address, field, kind, limit))
    }
    if (kind === 'delegation') {
      operations.push(this.apiService.getTransactionsByField(address, 'delegate', 'origination', limit))
    }
    if (kind === 'ballot') {
      const fields = kindToFieldsMap.proposals
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
}
