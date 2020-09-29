import { Injectable } from '@angular/core'
import { forkJoin, Observable, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'

import { Account, JsonAccountData } from '@tezblock/interfaces/Account'
import { ApiService } from '../api/api.service'
import { Transaction } from 'src/app/interfaces/Transaction'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { sort } from '@tezblock/domain/table'
import { first, get } from '@tezblock/services/fp'
import { SearchOption, SearchOptionType } from '@tezblock/services/search/model'

const accounts = require('src/submodules/tezos_assets/accounts.json')

export const getAddressesFilteredBy = (phrase: string) =>
  Object.keys(accounts).filter(address => {
    if (!phrase) {
      return true
    }

    return address.toLowerCase().includes(phrase.toLowerCase())
  })

export const getAddressByAlias = (alias: string) => Object.keys(accounts).find(address => accounts[address].alias === alias)

export const getBakers = (): JsonAccountData[] =>
  Object.keys(accounts)
    .map(address => ({ ...accounts[address], address }))
    .filter(
      account => !account.accountType || get<string>(accountType => !['account', 'contract'].includes(accountType))(account.accountType)
    )

export const doesAcceptsDelegations = (jsonAccount: JsonAccountData): boolean =>
  jsonAccount.hasOwnProperty('acceptsDelegations') ? jsonAccount.acceptsDelegations : true

export interface GetDelegatedAccountsResponseDto {
  delegated: Account[]
  related: Account[]
}

@Injectable({
  providedIn: 'root'
})
export class AccountService extends BaseService {
  constructor(readonly chainNetworkService: ChainNetworkService, readonly httpClient: HttpClient) {
    super(chainNetworkService, httpClient)
  }

  getAccountById(id: string): Observable<Account> {
    return this.post<Account[]>('accounts', {
      predicates: [
        {
          field: 'account_id',
          operation: Operation.eq,
          set: [id],
          inverse: false
        }
      ],
      limit: 1
    }).pipe(
      switchMap(accounts => {
        return this.isBaker(accounts[0].account_id).pipe(
          map(bakingStatus => {
            return { ...accounts[0], is_baker: bakingStatus } // CONSEIL currently does not reliably provide the correct value for is_baker
          })
        )
      })
    )
  }

  getAccountsByIds(ids: string[]): Observable<Account[]> {
    return this.post<Account[]>('accounts', {
      predicates: [
        {
          field: 'account_id',
          operation: Operation.in,
          set: ids,
          inverse: false
        }
      ]
    })
  }

  getDelegatedAccounts(address: string): Observable<GetDelegatedAccountsResponseDto> {
    return this._getDelegatedAccounts(address, 10).pipe(
      switchMap((transactions: Transaction[]) => {
        if (transactions.length === 0) {
          // there exists the possibility that we're dealing with a kt address which might be delegated, but does not have delegated accounts itself
          return this.getAccountById(address).pipe(
            map((account: Account) => {
              const delegated = account && account.delegate_value ? [account] : []

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

          return forkJoin([this.getAccountById(address), this.getAccountsByIds(originatedContracts)]).pipe(
            map(([account, relatedAccounts]) => {
              const delegatedAccounts = account.delegate_value ? [account] : []

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

        return forkJoin([this.getAccountById(address), this.getAccountsByIds(managerPubKeys)]).pipe(
          map(([account, relatedAccounts]) => {
            const delegated = account.delegate_value ? [account] : []

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

  getAccountsStartingWith(id: string, matchByAccountIds = true): Observable<SearchOption[]> {
    const bakers: SearchOption[] = Object.keys(accounts)
      .map(key => accounts[key])
      .filter(
        account =>
          (!account.accountType || get<string>(accountType => !['account', 'contract'].includes(accountType))(account.accountType)) &&
          get<string>(alias => alias.toLowerCase().startsWith(id.toLowerCase()))(account.alias)
      )
      .map(account => ({ name: account.alias, type: SearchOptionType.baker }))

    if (bakers.length === 0 && matchByAccountIds) {
      return this.post<Account[]>('accounts', {
        fields: ['account_id'],
        predicates: [
          {
            field: 'account_id',
            operation: Operation.startsWith,
            set: [id],
            inverse: false
          }
        ],
        limit: 5
      }).pipe(
        map(_accounts =>
          _accounts
            .filter(account => {
              const isContract = Object.keys(accounts)
                .map(key => ({ ...accounts[key], id: key }))
                .some(_account => _account.id === account.account_id && _account.accountType === 'contract')

              return !isContract
            })
            .map(account => {
              return { name: account.account_id, type: SearchOptionType.account }
            })
        )
      )
    }

    return of(bakers)
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
