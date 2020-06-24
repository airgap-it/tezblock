import { Injectable } from '@angular/core'
import { forkJoin, Observable, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'

import { Account } from '../../interfaces/Account'
import { ApiService } from '../api/api.service'
import { Transaction } from 'src/app/interfaces/Transaction'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { sort } from '@tezblock/domain/table'

export interface GetDelegatedAccountsResponseDto {
  delegated: Account[]
  related: Account[]
}

@Injectable({
  providedIn: 'root'
})
export class AccountService extends BaseService {
  constructor(private readonly apiService: ApiService, readonly chainNetworkService: ChainNetworkService, readonly httpClient: HttpClient) {
    super(chainNetworkService, httpClient)
  }

  getAccountById(id: string): Observable<Account[]> {
    return this.post<Account[]>(
      'accounts',
      {
        predicates: [
          {
            field: 'account_id',
            operation: Operation.eq,
            set: [id],
            inverse: false
          }
        ],
        limit: 1
      }
    )
  }

  getDelegatedAccounts(address: string): Observable<GetDelegatedAccountsResponseDto> {
    return this._getDelegatedAccounts(address, 10).pipe(
      switchMap((transactions: Transaction[]) => {
        if (transactions.length === 0) {
          // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
          return this.getAccountById(address).pipe(
            map((accounts: Account[]) => {
              const delegated = accounts.length > 0 && accounts[0].delegate_value ? [accounts[0]] : []

              return {
                delegated,
                related: []
              }
            })
          )
        }

        if (address.startsWith('tz')) {
          // since babylon, also tz addresses themselves can be delegated

          const originatedContracts = transactions.map(transaction => transaction.originated_contracts)

          return forkJoin(this.getAccountById(address), this.apiService.getAccountsByIds(originatedContracts)).pipe(
            map(([accounts, relatedAccounts]) => {
              const delegatedAccounts = accounts[0].delegate_value ? accounts : []

              return {
                delegated:
                  delegatedAccounts.length > 0
                    ? delegatedAccounts
                    : relatedAccounts.filter(relatedAccount => relatedAccount.delegate_value),
                related: relatedAccounts
              }
            })
          )
        }

        const managerPubKeys = transactions.map(transaction => transaction.manager_pubkey)

        return forkJoin(this.getAccountById(address), this.apiService.getAccountsByIds(managerPubKeys)).pipe(
          map(([accounts, relatedAccounts]) => {
            const delegated = accounts[0].delegate_value ? accounts : []

            return {
              delegated,
              related: relatedAccounts
            }
          })
        )
      })
    )
  }

  getAccountStatus(address: string): Observable<string> {
    return this.post<Transaction[]>('operations', {
      predicates: [
        {
          field: 'operation_group_hash',
          operation: Operation.isnull,
          inverse: true
        },
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['reveal']
        },
        {
          field: 'source',
          operation: Operation.eq,
          set: [address]
        }
      ],
      orderBy: [sort('block_level', 'desc')],
      limit: 1
    }).pipe(
      map(transactions => (transactions.length > 0 ? 'Revealed' : 'Not Revealed')),
      catchError(() => of('Not Available'))
    )
  }

  private _getDelegatedAccounts(address: string, limit: number): Observable<Transaction[]> {
    if (address.startsWith('tz')) {
      return this.post<Transaction[]>('operations', {
        predicates: [
          {
            field: 'manager_pubkey',
            operation: Operation.eq,
            set: [address],
            inverse: false
          },
          {
            field: 'originated_contracts',
            operation: Operation.isnull,
            set: [''],
            inverse: true
          },
          {
            field: 'status',
            operation: Operation.eq,
            set: ['applied'],
            inverse: false
          }
        ],
        orderBy: [
          {
            field: 'balance',
            direction: 'desc'
          }
        ],
        limit
      })
    }

    return this.post<Transaction[]>('operations', {
      predicates: [
        {
          field: 'originated_contracts',
          operation: Operation.eq,
          set: [address],
          inverse: false
        },
        {
          field: 'manager_pubkey',
          operation: Operation.isnull,
          set: [''],
          inverse: true
        },
        {
          field: 'status',
          operation: Operation.eq,
          set: ['applied'],
          inverse: false
        }
      ],
      orderBy: [
        {
          field: 'balance',
          direction: 'desc'
        }
      ],
      limit
    })
  }
}
