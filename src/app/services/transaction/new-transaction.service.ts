import { Injectable } from '@angular/core'
import { forkJoin, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { ApiService } from '../api/api.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { andGroup, Operation, Predicate } from '@tezblock/services/base.service'

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

  getAllTransactionsByAddress(address: string, kind: string, limit: number) {
    const fields = kindToFieldsMap[kind]
    const operations: Observable<Transaction[]>[] = []

    operations.push(...fields.map(field => this.apiService.getTransactionsByField(address, field, kind, limit)))

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
      switchMap(operation => {
        const transactions = operation
          .reduce((current, next) => current.concat(next))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
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
      switchMap(transactions => {
        if (kind === 'ballot') {
          return forkJoin(
            forkJoin(transactions.map(transaction => this.apiService.getVotingPeriod(transaction.block_level))),
            forkJoin(transactions.map(transaction => this.apiService.getVotesForTransaction(transaction)))
          ).pipe(
            map(([votingPeriods, votes]) =>
              transactions.map((transaction, index) => ({
                ...transaction,
                voting_period: votingPeriods[index],
                votes: votes[index]
              }))
            )
          )
        }

        return of(transactions)
      })
    )
  }

  /* ############## NEW ONE ################# */
  getAllTransactionsByAddress2(address: string, kind: string, limit: number) {
    const fields = kindToFieldsMap[kind]
    const idNotNullPredicate = {
      field: 'operation_group_hash',
      operation: Operation.isnull,
      inverse: true
    }
    const preprocess = (transactions: Transaction[]) =>
        transactions.map(transaction => ({
          ...transaction,
          proposal: transaction.proposal ? transaction.proposal.slice(1, transaction.proposal.length - 1) : transaction.proposal
        }))
    const predicates: Predicate[] = []

    predicates.push(
      ...[].concat(
        ...fields.map((field, index) =>
          andGroup([{ field, set: [address] }, { field: 'kind', set: [kind] }], `A${index}`)
        )
      ),
      idNotNullPredicate
    )

    if (kind === 'delegation') {
      predicates.push(
        ...andGroup([{ field: 'delegate', set: [address] }, { field: 'kind', set: ['origination'] }], 'B')
      )
    }

    if (kind === 'ballot') {
      const fields = kindToFieldsMap.proposals
      predicates.push(
        ...[].concat(
          ...fields.map((field, index) =>
            andGroup([{ field, set: [address] }, { field: 'kind', set: ['proposals'] }], `C${index}`)
          )
        )
      )
    }

    return this.apiService.getTransactionsByPredicates(predicates, limit).pipe(
      map(preprocess),
      switchMap(operation => {
        const transactions = operation
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
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
      switchMap(transactions => {
        if (kind === 'ballot') {
          return forkJoin(
            forkJoin(transactions.map(transaction => this.apiService.getVotingPeriod(transaction.block_level))),
            forkJoin(transactions.map(transaction => this.apiService.getVotesForTransaction(transaction)))
          ).pipe(
            map(([votingPeriods, votes]) =>
              transactions.map((transaction, index) => ({
                ...transaction,
                voting_period: votingPeriods[index],
                votes: votes[index]
              }))
            )
          )
        }

        return of(transactions)
      })
    )
  }
}
