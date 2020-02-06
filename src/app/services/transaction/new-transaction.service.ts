import { Injectable } from '@angular/core'
import { of, concat } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { ApiService } from '../api/api.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { andGroup, Operation, Predicate, OrderBy } from '@tezblock/services/base.service'

const kindToFieldsMap = {
  transaction: ['source', 'destination'],
  delegation: ['source', 'delegate'],
  origination: ['source'],
  endorsement: ['delegate'],
  ballot: ['source'],
  proposals: ['source']
}

@Injectable({
  providedIn: 'root'
})
export class NewTransactionService {
  constructor(private readonly apiService: ApiService) {}

  getAllTransactionsByAddress(address: string, kind: string, limit: number, sortingValue?: string, sortingDirection?: any) {
    const fields = kindToFieldsMap[kind]
    const idNotNullPredicate = {
      field: 'operation_group_hash',
      operation: Operation.isnull,
      inverse: true
    }

    // it was applied to transactions with kind ballot ...
    const preprocess = (transactions: Transaction[]) =>
      transactions.map(transaction => ({
        ...transaction,
        proposal: transaction.proposal ? transaction.proposal.slice(1, transaction.proposal.length - 1) : transaction.proposal
      }))
    const predicates: Predicate[] = []

    predicates.push(
      ...[].concat(
        ...fields.map((field, index) =>
          andGroup([{ field, set: [address] }, { field: 'kind', set: [kind] }, idNotNullPredicate], `A${index}`)
        )
      )
    )

    if (kind === 'delegation') {
      predicates.push(
        ...andGroup([{ field: 'delegate', set: [address] }, { field: 'kind', set: ['origination'] }, idNotNullPredicate], 'B')
      )
    }

    if (kind === 'ballot') {
      predicates.push(
        ...[].concat(
          ...kindToFieldsMap.proposals.map((field, index) =>
            andGroup([{ field, set: [address] }, { field: 'kind', set: ['proposals'] }, idNotNullPredicate], `C${index}`)
          )
        )
      )
    }

    let apiCall = this.apiService.getTransactionsByPredicates(predicates, limit)

    if (sortingValue && sortingDirection) {
      const orderBy: OrderBy = { field: sortingValue, direction: sortingDirection }
      apiCall = this.apiService.getTransactionsByPredicates(predicates, limit, orderBy)
    }

    return apiCall.pipe(
      // map(preprocess),
      switchMap(operation => {
        let transactions = operation
        sortingValue && sortingDirection
          ? sortingValue === 'delegatedBalance' || sortingValue === 'originatedBalance'
            ? sortingDirection === 'desc'
              ? (transactions = operation.sort((a, b) => b.delegatedBalance - a.delegatedBalance)) // tslint:disable
              : (transactions = operation.sort((a, b) => a.delegatedBalance - b.delegatedBalance)) // tslint:disable
            : (transactions = operation)
          : (transactions = operation.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit))
        const sources: string[] = transactions.map(transaction => transaction.source)

        if (kind === 'delegation' && sources.length > 0) {
          return this.apiService.getAccountsByIds(sources).pipe(
            map(delegators =>
              transactions.map(transaction => {
                const match = delegators.find(delegator => delegator.account_id === transaction.source)

                return match ? { ...transaction, delegatedBalance: match.balance } : transaction
              })
            )
          )
        }

        return of(transactions)
      }),
      switchMap(transactions => {
        if (kind === 'origination') {
          const originatedSources: string[] = transactions.map(transaction => transaction.originated_contracts)

          if (originatedSources.length > 0) {
            this.apiService.getAccountsByIds(originatedSources).pipe(
              map(originators =>
                transactions.map(transaction => {
                  const match = originators.find(originator => originator.account_id === transaction.originated_contracts)

                  return match ? { ...transaction, originatedBalance: match.balance } : transaction
                })
              )
            )
          }
        }

        return of(transactions)
      }),
      switchMap(transactions => this.apiService.addVoteData(transactions))
    )
  }
}
