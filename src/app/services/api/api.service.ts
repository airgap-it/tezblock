import { BigNumber } from 'bignumber.js'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { Observable, of, pipe, from, forkJoin, combineLatest } from 'rxjs'
import { map, switchMap, filter } from 'rxjs/operators'
import { TezosProtocol, TezosFAProtocol, TezosTransactionResult, TezosTransactionCursor } from 'airgap-coin-lib'

import { AggregatedBakingRights, BakingRights, getEmptyAggregatedBakingRight, BakingRewardsDetail } from '@tezblock/interfaces/BakingRights'
import {
  EndorsingRights,
  AggregatedEndorsingRights,
  getEmptyAggregatedEndorsingRight,
  EndorsingRewardsDetail
} from '@tezblock/interfaces/EndorsingRights'
import { Account } from '@tezblock/interfaces/Account'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { VotingInfo, VotingPeriod } from '@tezblock/domain/vote'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { distinctFilter, first, get, groupBy, last, flatten } from '@tezblock/services/fp'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { Predicate, Operation } from '../base.service'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { TokenContract } from '@tezblock/domain/contract'
import { sort } from '@tezblock/domain/table'
import { RPCBlocksOpertions, RPCContent, OperationErrorsById, OperationError } from '@tezblock/domain/operations'
import { SearchOption, SearchOptionType } from '@tezblock/services/search/model'

export interface OperationCount {
  [key: string]: string
  field: string
  kind: string
}

export interface Baker {
  pkh: string
  block_level: number
  delegated_balance: number
  balance: number
  deactivated: boolean
  staking_balance: number
  block_id: string
  frozen_balance: number
  grace_period: number
  number_of_delegators?: number
}

export interface NumberOfDelegatorsByBakers {
  delegate_value: string
  number_of_delegators: number
}

export interface Balance {
  balance: number
  asof: number
}

const accounts = require('../../../assets/bakers/json/accounts.json')
const cycleToLevel = (cycle: number): number => cycle * 4096
export const addCycleFromLevel = right => ({ ...right, cycle: Math.floor(right.level / 4096) })

function ensureCycle<T extends { cycle: number }>(cycle: number, factory: () => T) {
  return (rights: T[]): T[] => (rights.some(right => right.cycle === cycle) ? rights : [{ ...factory(), cycle }].concat(rights))
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  environmentUrls = this.chainNetworkService.getEnvironment()
  environmentVariable = this.chainNetworkService.getEnvironmentVariable()
  protocol: TezosProtocol

  private readonly bakingRightsApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/baking_rights`
  private readonly endorsingRightsApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/endorsing_rights`
  private readonly blocksApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/blocks`
  private readonly transactionsApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/operations`
  private readonly accountsApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/accounts`
  private readonly delegatesApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/delegates`
  private readonly accountHistoryApiUrl = `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/accounts_history`

  private readonly options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      apikey: this.environmentUrls.conseilApiKey
    })
  }

  constructor(
    private readonly http: HttpClient,
    readonly chainNetworkService: ChainNetworkService,
    private readonly rewardService: RewardService
  ) {
    const network = this.chainNetworkService.getNetwork()
    this.protocol = new TezosProtocol(
      this.environmentUrls.rpcUrl,
      this.environmentUrls.conseilUrl,
      network,
      this.chainNetworkService.getEnvironmentVariable(),
      this.environmentUrls.conseilApiKey
    )
  }

  getCurrentCycleRange(currentCycle: number): Observable<Block[]> {
    return this.http.post<Block[]>(
      this.blocksApiUrl,
      {
        predicates: [
          {
            field: 'meta_cycle',
            operation: 'eq',
            set: [currentCycle],
            inverse: false
          }
        ],
        orderBy: [sort('timestamp', 'asc')],
        limit: 1
      },
      this.options
    )
  }

  getLatestTransactions(limit: number, kindList: string[], orderBy = sort('block_level', 'desc')): Observable<Transaction[]> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [
            {
              field: 'operation_group_hash',
              operation: 'isnull',
              inverse: true
            },
            {
              field: 'kind',
              operation: 'in',
              set: kindList
            }
          ],
          orderBy: [orderBy],
          limit
        },
        this.options
      )
      .pipe(
        map(transactions => transactions.slice(0, limit)),
        switchMap(transactions => {
          const originatedAccounts = transactions
            .filter(transaction => transaction.kind === 'origination')
            .map(transaction => transaction.originated_contracts)

          if (originatedAccounts.length > 0) {
            return this.getAccountsByIds(originatedAccounts).pipe(
              map(originators =>
                transactions.map(transaction => {
                  const match = originators.find(originator => originator.account_id === transaction.originated_contracts)

                  return match ? { ...transaction, originatedBalance: match.balance } : transaction
                })
              )
            )
          }

          return of(transactions)
        }),
        switchMap((transactions: Transaction[]) => this.addVoteData(transactions, kindList))
      )
  }

  getTransactionsById(id: string, limit: number, orderBy = sort('block_level', 'desc')): Observable<Transaction[]> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [
            {
              field: 'operation_group_hash',
              operation: 'eq',
              set: [id],
              inverse: false
            }
          ],
          orderBy: [orderBy],
          limit
        },
        this.options
      )
      .pipe(
        map(transactions => transactions.slice(0, limit)),
        switchMap((transactions: Transaction[]) => {
          const sources = transactions.filter(transaction => transaction.kind === 'delegation').map(transaction => transaction.source)

          if (sources.length > 0) {
            return this.getAccountsByIds(sources).pipe(
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
        switchMap((transactions: Transaction[]) => {
          const originatedAccounts = transactions
            .filter(transaction => transaction.kind === 'origination')
            .map(transaction => transaction.originated_contracts)

          if (originatedAccounts.length > 0) {
            return this.getAccountsByIds(originatedAccounts).pipe(
              map(originators =>
                transactions.map(transaction => {
                  const match = originators.find(originator => originator.account_id === transaction.originated_contracts)

                  return match ? { ...transaction, originatedBalance: match.balance } : transaction
                })
              )
            )
          }

          return of(transactions)
        }),
        switchMap((transactions: Transaction[]) => this.addVoteData(transactions))
      )
  }

  addVoteData(transactions: Transaction[], kindList?: string[]): Observable<Transaction[]> {
    kindList = kindList || transactions.map(transaction => transaction.kind).filter(distinctFilter)

    if (kindList.includes('ballot') || kindList.includes('proposals')) {
      const votingPeriodPredicates: Predicate[] = transactions
        .map(transaction => transaction.block_level)
        .filter(distinctFilter)
        .map((block_level, index) => ({
          field: 'level',
          operation: Operation.eq,
          set: [block_level.toString()],
          inverse: false,
          group: `A${index}`
        }))

      return forkJoin(
        this.getVotingPeriod(votingPeriodPredicates),
        forkJoin(transactions.map(transaction => this.getVotesForTransaction(transaction)))
      ).pipe(
        map(([votingPeriods, votes]) =>
          transactions.map((transaction, index) => {
            const votingPeriod = votingPeriods.find(vP => vP.level === transaction.block_level)

            return {
              ...transaction,
              voting_period: votingPeriod.period_kind,
              votes: votes[index]
            }
          })
        )
      )
    }

    return of(transactions)
  }

  getEndorsementsById(id: string, limit: number): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(
      this.transactionsApiUrl,
      {
        predicates: [
          {
            field: 'operation_group_hash',
            operation: 'eq',
            set: [id],
            inverse: false
          },
          {
            field: 'kind',
            operation: 'eq',
            set: ['endorsement']
          }
        ],
        limit
      },
      this.options
    )
  }

  getTransactionsByBlock(blockHash: string, limit: number): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(
      this.transactionsApiUrl,
      {
        predicates: [
          {
            field: 'operation_group_hash',
            operation: 'isnull',
            inverse: true
          },
          {
            field: 'block_hash',
            operation: 'eq',
            set: [blockHash]
          },
          {
            field: 'kind',
            operation: 'eq',
            set: ['transaction']
          }
        ],
        orderBy: [sort('block_level', 'desc')],
        limit
      },
      this.options
    )
  }

  getTransactionsByField(
    value: string,
    field: string,
    kind: string,
    limit: number,
    orderBy = sort('block_level', 'desc')
  ): Observable<Transaction[]> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [
            {
              field: 'operation_group_hash',
              operation: 'isnull',
              inverse: true
            },
            {
              field,
              operation: 'eq',
              set: [value]
            },
            {
              field: 'kind',
              operation: 'eq',
              set: [kind]
            }
          ],
          orderBy: [orderBy],
          limit
        },
        this.options
      )
      .pipe(
        map((transactions: Transaction[]) => transactions.slice(0, limit)),
        switchMap((transactions: Transaction[]) => {
          const sources = transactions.filter(transaction => transaction.kind === 'delegation').map(transaction => transaction.source)

          if (sources.length > 0) {
            return this.getAccountsByIds(sources).pipe(
              map((accounts: Account[]) =>
                transactions.map(transaction => {
                  const match = accounts.find(account => account.account_id === transaction.source)

                  return match ? { ...transaction, delegatedBalance: match.balance } : transaction
                })
              )
            )
          }

          return of(transactions)
        }),
        switchMap((transactions: Transaction[]) => {
          const originatedAccounts = transactions
            .filter(transaction => transaction.kind === 'origination')
            .map(transaction => transaction.originated_contracts)

          if (originatedAccounts.length > 0) {
            return this.getAccountsByIds(originatedAccounts).pipe(
              map((accounts: Account[]) =>
                transactions.map(transaction => {
                  const match = accounts.find(account => account.account_id === transaction.originated_contracts)

                  return match ? { ...transaction, originatedBalance: match.balance } : transaction
                })
              )
            )
          }

          return of(transactions)
        })
      )
  }

  getTransactionsByPredicates(predicates: Predicate[], limit: number, orderBy = sort('block_level', 'desc')): Observable<Transaction[]> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [...predicates],
          orderBy: [orderBy],
          limit
        },
        this.options
      )
      .pipe(
        map((transactions: Transaction[]) => transactions.slice(0, limit)),
        switchMap((transactions: Transaction[]) => {
          const sources = transactions.filter(transaction => transaction.kind === 'delegation').map(transaction => transaction.source)

          if (sources.length > 0) {
            return this.getAccountsByIds(sources).pipe(
              map((accounts: Account[]) =>
                transactions.map(transaction => {
                  const match = accounts.find(account => account.account_id === transaction.source)

                  return match ? { ...transaction, delegatedBalance: match.balance } : transaction
                })
              )
            )
          }

          return of(transactions)
        }),
        switchMap((transactions: Transaction[]) => {
          const originatedAccounts = transactions
            .filter(transaction => transaction.kind === 'origination')
            .map(transaction => transaction.originated_contracts)

          if (originatedAccounts.length > 0) {
            return this.getAccountsByIds(originatedAccounts).pipe(
              map((accounts: Account[]) =>
                transactions.map(transaction => {
                  const match = accounts.find(account => account.account_id === transaction.originated_contracts)

                  return match ? { ...transaction, originatedBalance: match.balance } : transaction
                })
              )
            )
          }

          return of(transactions)
        })
      )
  }

  getLatestAccounts(limit: number): Observable<Account[]> {
    return this.http.post<Account[]>(
      this.accountsApiUrl,
      {
        limit
      },
      this.options
    )
  }

  getAccountById(id: string): Observable<Account[]> {
    return this.http.post<Account[]>(
      this.accountsApiUrl,
      {
        predicates: [
          {
            field: 'account_id',
            operation: 'eq',
            set: [id],
            inverse: false
          }
        ],
        limit: 1
      },
      this.options
    )
  }
  getAccountsByIds(ids: string[]): Observable<Account[]> {
    return this.http.post<Account[]>(
      this.accountsApiUrl,
      {
        predicates: [
          {
            field: 'account_id',
            operation: 'in',
            set: ids,
            inverse: false
          }
        ]
      },
      this.options
    )
  }

  getAccountsStartingWith(id: string): Observable<SearchOption[]> {
    const bakers: SearchOption[] = Object.keys(accounts)
      .map(key => accounts[key])
      .filter(
        account =>
          (!account.accountType || get<string>(accountType => !['account', 'contract'].includes(accountType))(account.accountType)) &&
          get<string>(alias => alias.toLowerCase().startsWith(id.toLowerCase()))(account.alias)
      )
      .map(account => ({ name: account.alias, type: SearchOptionType.baker }))

    if (bakers.length === 0) {
      return this.http
        .post<Account[]>(
          this.accountsApiUrl,
          {
            fields: ['account_id'],
            predicates: [
              {
                field: 'account_id',
                operation: 'startsWith',
                set: [id],
                inverse: false
              }
            ],
            limit: 5
          },
          this.options
        )
        .pipe(
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

  getTransactionHashesStartingWith(id: string): Observable<SearchOption[]> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          fields: ['operation_group_hash'],
          predicates: [
            {
              field: 'operation_group_hash',
              operation: 'startsWith',
              set: [id],
              inverse: false
            }
          ],
          limit: 5
        },
        this.options
      )
      .pipe(
        map(results =>
          results.map(item => {
            return { name: item.operation_group_hash, type: SearchOptionType.transaction }
          })
        )
      )
  }

  getBlockHashesStartingWith(id: string): Observable<SearchOption[]> {
    return this.http
      .post<Block[]>(
        this.blocksApiUrl,
        {
          fields: ['hash'],
          predicates: [
            {
              field: 'hash',
              operation: 'startsWith',
              set: [id],
              inverse: false
            }
          ],
          limit: 5
        },
        this.options
      )
      .pipe(
        map(results =>
          results.map(item => {
            return { name: item.hash, type: SearchOptionType.block }
          })
        )
      )
  }

  getDelegatedAccounts(address: string, limit: number): Observable<Transaction[]> {
    if (address.startsWith('tz')) {
      return this.http.post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [
            {
              field: 'manager_pubkey',
              operation: 'eq',
              set: [address],
              inverse: false
            },
            {
              field: 'originated_contracts',
              operation: 'isnull',
              set: [''],
              inverse: true
            },
            {
              field: 'status',
              operation: 'eq',
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
        },
        this.options
      )
    } else {
      return this.http.post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [
            {
              field: 'originated_contracts',
              operation: 'eq',
              set: [address],
              inverse: false
            },
            {
              field: 'manager_pubkey',
              operation: 'isnull',
              set: [''],
              inverse: true
            },
            {
              field: 'status',
              operation: 'eq',
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
        },
        this.options
      )
    }
  }

  getManagerAccount(ktAddress: string, limit: number): Observable<Account[]> {
    return this.http.post<Account[]>(
      this.accountsApiUrl,
      {
        predicates: [
          {
            field: 'account_id',
            operation: 'eq',
            set: [ktAddress],
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
      },
      this.options
    )
  }

  getAccountStatus(address: string): Promise<string> {
    return new Promise(resolve => {
      this.http
        .post<Transaction[]>(
          this.transactionsApiUrl,
          {
            predicates: [
              {
                field: 'operation_group_hash',
                operation: 'isnull',
                inverse: true
              },
              {
                field: 'kind',
                operation: 'eq',
                set: ['reveal']
              },
              {
                field: 'source',
                operation: 'eq',
                set: [address]
              }
            ],
            orderBy: [sort('block_level', 'desc')],
            limit: 1
          },
          this.options
        )
        .subscribe(
          (transactions: Transaction[]) => {
            if (transactions.length > 0) {
              resolve('Revealed')
            } else {
              resolve('Not Revealed')
            }
          },
          err => {
            resolve('Not Available')
          }
        )
    })
  }

  getLatestBlocks(
    limit: number,
    orderBy = {
      field: 'timestamp',
      direction: 'desc'
    }
  ): Observable<Block[]> {
    return this.http.post<Block[]>(
      this.blocksApiUrl,
      {
        orderBy: [orderBy],
        limit
      },
      this.options
    )
  }

  getLatestBlocksWithData(
    limit: number,
    orderBy = {
      field: 'timestamp',
      direction: 'desc'
    }
  ): Observable<Block[]> {
    return this.http
      .post<Block[]>(
        this.blocksApiUrl,
        {
          orderBy: [orderBy],
          limit
        },
        this.options
      )
      .pipe(
        switchMap(blocks => {
          const blockRange = blocks.map(blocksList => blocksList.level)
          const amountObservable$ = this.getAdditionalBlockFieldObservable(blockRange, 'amount', 'sum', limit)
          const feeObservable$ = this.getAdditionalBlockFieldObservable(blockRange, 'fee', 'sum', limit)
          const operationGroupObservable$ = this.getAdditionalBlockFieldObservable(blockRange, 'operation_group_hash', 'count', limit)

          return combineLatest([amountObservable$, feeObservable$, operationGroupObservable$]).pipe(
            map(([amount, fee, operationGroup]) =>
              blocks.map(block => {
                const blockAmount: any = amount.find((amount: any) => amount.block_level === block.level)
                const blockFee: any = fee.find((fee: any) => fee.block_level === block.level)
                const blockOperations: any = operationGroup.find((operation: any) => operation.block_level === block.level)
                return {
                  ...block,
                  volume: blockAmount ? blockAmount.sum_amount : 0,
                  fee: blockFee ? blockFee.sum_fee : 0,
                  txcount: blockOperations ? blockOperations.count_operation_group_hash : '0'
                }
              })
            )
          )
        })
      )
  }

  getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string): Promise<T[]> {
    let headers
    if (field === 'operation_group_hash') {
      // then we only care about spend transactions
      headers = {
        fields: [field, 'block_level'],
        predicates: [
          {
            field,
            operation: 'isnull',
            inverse: true
          },
          {
            field: 'block_level',
            operation: 'in',
            set: blockRange
          },
          {
            field: 'kind',
            operation: 'in',
            set: ['transaction']
          }
        ],
        orderBy: [sort('block_level', 'desc')],
        aggregation: [
          {
            field,
            function: operation
          }
        ]
      }
    } else {
      headers = {
        fields: [field, 'block_level'],
        predicates: [
          {
            field,
            operation: 'isnull',
            inverse: true
          },
          {
            field: 'block_level',
            operation: 'in',
            set: blockRange
          }
        ],
        orderBy: [sort('block_level', 'desc')],
        aggregation: [
          {
            field,
            function: operation
          }
        ]
      }
    }

    return new Promise((resolve, reject) => {
      this.http.post<T[]>(this.transactionsApiUrl, headers, this.options).subscribe((volumePerBlock: T[]) => {
        resolve(volumePerBlock)
      })
    })
  }

  getAdditionalBlockFieldObservable<T>(blockRange: number[], field: string, operation: string, limit: number): Observable<T[]> {
    let headers
    if (field === 'operation_group_hash') {
      // then we only care about spend transactions
      headers = {
        fields: [field, 'block_level'],
        predicates: [
          {
            field,
            operation: 'isnull',
            inverse: true
          },
          {
            field: 'block_level',
            operation: 'in',
            set: blockRange
          },
          {
            field: 'kind',
            operation: 'in',
            set: ['transaction']
          }
        ],
        orderBy: [sort('block_level', 'desc')],
        aggregation: [
          {
            field,
            function: operation
          }
        ],
        limit
      }
    } else {
      headers = {
        fields: [field, 'block_level'],
        predicates: [
          {
            field,
            operation: 'isnull',
            inverse: true
          },
          {
            field: 'block_level',
            operation: 'in',
            set: blockRange
          }
        ],
        orderBy: [sort('block_level', 'desc')],
        aggregation: [
          {
            field,
            function: operation
          }
        ],
        limit
      }
    }

    return this.http.post<T[]>(this.transactionsApiUrl, headers, this.options)
  }

  getOperationCount(field: string, value: string): Observable<OperationCount[]> {
    const body = {
      fields: [field, 'kind'],
      predicates: [
        {
          field,
          operation: 'eq',
          set: [value],
          inverse: false
        }
      ],
      aggregation: [
        {
          field,
          function: 'count'
        }
      ]
    }

    return this.http
      .post<OperationCount[]>(this.transactionsApiUrl, body, this.options)
      .pipe(map(operationCounts => operationCounts.map(operationCount => ({ ...operationCount, field }))))
  }

  getBlockById(id: string): Observable<Block[]> {
    return this.http.post<Block[]>(
      this.blocksApiUrl,
      {
        predicates: [
          {
            field: 'level',
            operation: 'eq',
            set: [id],
            inverse: false
          }
        ],
        limit: 1
      },
      this.options
    )
  }

  getBlocksOfIds(blockIds: number[]): Observable<Block[]> {
    const limit = blockIds.length
    return this.http.post<Block[]>(
      this.blocksApiUrl,
      {
        predicates: [
          {
            field: 'level',
            operation: 'in',
            set: blockIds,
            inverse: false
          }
        ],
        limit: limit
      },
      this.options
    )
  }

  getBlockByHash(hash: string): Observable<Block[]> {
    return this.http.post<Block[]>(
      this.blocksApiUrl,
      {
        predicates: [
          {
            field: 'hash',
            operation: 'eq',
            set: [hash],
            inverse: false
          }
        ],
        limit: 1
      },
      this.options
    )
  }

  getVotesForTransaction(transaction: Transaction): Observable<number> {
    return from(this.protocol.getTezosVotingInfo(transaction.block_hash)).pipe(
      map(data => {
        const votingInfo = data.find((element: VotingInfo) => element.pkh === transaction.source)

        return votingInfo ? votingInfo.rolls : null
      })
    )
  }

  private getBakingRights(address: string, limit?: number, predicates?: Predicate[]): Observable<BakingRights[]> {
    const _predicates = (<Predicate[]>[
      {
        field: 'delegate',
        operation: 'eq',
        set: [address]
      },
      {
        field: 'priority',
        operation: 'eq',
        set: ['0']
      }
    ]).concat(predicates || [])

    return this.http
      .post<BakingRights[]>(
        this.bakingRightsApiUrl,
        {
          predicates: _predicates,
          orderBy: [
            {
              field: 'level',
              direction: 'desc'
            }
          ],
          limit: limit
        },
        this.options
      )
      .pipe(map((rights: BakingRights[]) => rights.map(addCycleFromLevel)))
  }

  getAggregatedBakingRights(address: string, limit: number): Observable<AggregatedBakingRights[]> {
    return this.rewardService.getLastCycles({ selectedSize: limit, currentPage: 1 }).pipe(
      switchMap(cycles =>
        forkJoin(
          cycles.map(cycle =>
            from(this.rewardService.calculateRewards(address, cycle)).pipe(
              map((reward: TezosRewards) => ({
                cycle,
                bakingsCount: reward.bakingRewardsDetails.length,
                blockRewards: reward.bakingRewards,
                deposits: reward.bakingDeposits,
                fees: new BigNumber(reward.fees).toNumber(),
                bakingRewardsDetails: reward.bakingRewardsDetails
              }))
            )
          )
        ).pipe(
          map((aggregatedRights: AggregatedBakingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle)),
          map(ensureCycle(first(cycles), getEmptyAggregatedBakingRight))
        )
      )
    )
  }

  getBakingRightsItems(address: string, cycle: number, bakingRewardsDetails: BakingRewardsDetail[]): Observable<BakingRights[]> {
    const minLevel = cycleToLevel(cycle)
    const maxLevel = cycleToLevel(cycle + 1)
    const predicates = [
      {
        field: 'level',
        operation: Operation.gt,
        set: [minLevel]
      },
      {
        field: 'level',
        operation: Operation.lt,
        set: [maxLevel]
      }
    ]
    const rewardByLevel = bakingRewardsDetails.reduce(
      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue), accumulator),
      {}
    )
    const setRewardsDepositsAndFees = (right: BakingRights): BakingRights => ({
      ...right,
      rewards: rewardByLevel[right.level] ? rewardByLevel[right.level].amount : '0',
      deposit: rewardByLevel[right.level] ? rewardByLevel[right.level].deposit : '0',
      fees: rewardByLevel[right.level] ? rewardByLevel[right.level].fees : '0'
    })

    return this.getBakingRights(address, null, predicates).pipe(
      map((rights: BakingRights[]) => rights.map(addCycleFromLevel)),
      map((rights: BakingRights[]) => rights.map(setRewardsDepositsAndFees))
    )
  }

  private getEndorsingRights(address: string, limit?: number, predicates?: Predicate[]): Observable<EndorsingRights[]> {
    const _predicates = (<Predicate[]>[
      {
        field: 'delegate',
        operation: Operation.eq,
        set: [address]
      }
    ]).concat(predicates || [])

    return this.http
      .post<EndorsingRights[]>(
        this.endorsingRightsApiUrl,
        {
          fields: ['level', 'slot', 'estimated_time'],
          predicates: _predicates,
          orderBy: [
            {
              field: 'level',
              direction: 'desc'
            }
          ],
          limit: limit
        },
        this.options
      )
      .pipe(map((rights: EndorsingRights[]) => rights.map(addCycleFromLevel)))
  }

  getAggregatedEndorsingRights(address: string, limit: number): Observable<AggregatedEndorsingRights[]> {
    return this.rewardService.getLastCycles({ selectedSize: limit, currentPage: 1 }).pipe(
      switchMap(cycles =>
        forkJoin(
          cycles.map(cycle =>
            from(this.rewardService.calculateRewards(address, cycle)).pipe(
              map((reward: TezosRewards) => ({
                cycle,
                endorsementRewards: reward.endorsingRewards,
                deposits: reward.endorsingDeposits,
                endorsementsCount: reward.endorsingRewardsDetails.length,
                endorsingRewardsDetails: reward.endorsingRewardsDetails
              }))
            )
          )
        ).pipe(
          map((aggregatedRights: AggregatedEndorsingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle)),
          map(ensureCycle(first(cycles), getEmptyAggregatedEndorsingRight))
        )
      )
    )
  }

  getEndorsingRightItems(address: string, cycle: number, endorsingRewardsDetails: EndorsingRewardsDetail[]): Observable<EndorsingRights[]> {
    const minLevel = cycleToLevel(cycle)
    const maxLevel = cycleToLevel(cycle + 1)
    const predicates = [
      {
        field: 'level',
        operation: Operation.gt,
        set: [minLevel]
      },
      {
        field: 'level',
        operation: Operation.lt,
        set: [maxLevel]
      }
    ]
    const rewardByLevel = endorsingRewardsDetails.reduce(
      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue), accumulator),
      {}
    )
    const setRewardsAndDeposits = (right: EndorsingRights): EndorsingRights => ({
      ...right,
      rewards: rewardByLevel[right.level] ? rewardByLevel[right.level].amount : '0',
      deposit: rewardByLevel[right.level] ? rewardByLevel[right.level].deposit : '0'
    })

    return this.getEndorsingRights(address, 30000, predicates).pipe(
      map((rights: EndorsingRights[]) => rights.map(addCycleFromLevel)),
      map((rights: EndorsingRights[]) => rights.map(setRewardsAndDeposits))
    )
  }

  getEndorsedSlotsCount(blockHash: string): Observable<number> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [
            {
              field: 'operation_group_hash',
              operation: 'isnull',
              inverse: true
            },
            {
              field: 'block_hash',
              operation: 'eq',
              set: [blockHash]
            },
            {
              field: 'kind',
              operation: 'eq',
              set: ['endorsement']
            }
          ],
          orderBy: [sort('block_level', 'desc')],
          limit: 32
        },
        this.options
      )
      .pipe(map((transactions: Transaction[]) => _.flatten(transactions.map(transaction => JSON.parse(transaction.slots))).length))
  }

  getFrozenBalance(tzAddress: string): Observable<number> {
    return this.http
      .post<any[]>(
        this.delegatesApiUrl,
        {
          fields: ['frozen_balance'],
          predicates: [
            {
              field: 'pkh',
              operation: 'eq',
              set: [tzAddress],
              inverse: false
            }
          ]
        },
        this.options
      )
      .pipe(
        map(
          pipe<any[], any, number>(
            first,
            get(_first => _first.frozen_balance)
          )
        )
      )
  }

  getDelegatedAccountsList(tzAddress: string): Observable<any[]> {
    return this.http.post<any[]>(
      this.accountsApiUrl,
      {
        fields: ['account_id', 'manager', 'delegate_value', 'balance'],
        predicates: [
          {
            field: 'delegate_value',
            operation: 'eq',
            set: [tzAddress],
            inverse: false
          }
        ],
        orderBy: [{ field: 'count_account_id', direction: 'desc' }],
        aggregation: [
          {
            field: 'account_id',
            function: 'count'
          }
        ]
      },
      this.options
    )
  }

  getVotingPeriod(predicates: Predicate[]): Observable<VotingPeriod[]> {
    return this.http.post<VotingPeriod[]>(
      this.blocksApiUrl,
      {
        fields: ['level', 'period_kind'],
        predicates
      },
      this.options
    )
  }

  getActiveBakers(limit: number, orderBy = { field: 'staking_balance', direction: 'desc' }): Observable<Baker[]> {
    return this.http.post<Baker[]>(
      this.delegatesApiUrl,
      {
        fields: [],
        predicates: [
          {
            field: 'staking_balance',
            operation: 'gt',
            set: ['8000000000'],
            inverse: false
          }
        ],
        orderBy: [orderBy],
        limit
      },
      this.options
    )
  }

  getTotalBakersAtTheLatestBlock(): Observable<number> {
    return this.http
      .post<{ count_pkh: number }[]>(
        this.delegatesApiUrl,
        {
          fields: ['pkh'],
          predicates: [
            {
              field: 'staking_balance',
              operation: 'gt',
              set: ['8000000000'],
              inverse: false
            }
          ],
          orderBy: [{ field: 'count_pkh', direction: 'desc' }],
          aggregation: [
            {
              field: 'pkh',
              function: 'count'
            }
          ]
        },
        this.options
      )
      .pipe(map(response => (Array.isArray(response) && response.length > 0 ? response[0].count_pkh : null)))
  }

  getNumberOfDelegatorsByBakers(delegates: string[]): Observable<NumberOfDelegatorsByBakers[]> {
    return this.http
      .post<any[]>(
        this.accountsApiUrl,
        {
          fields: ['account_id', 'manager', 'delegate_value', 'balance'],
          predicates: [
            {
              field: 'delegate_value',
              operation: 'in',
              set: delegates,
              inverse: false
            }
          ],
          aggregation: [
            {
              field: 'account_id',
              function: 'count'
            }
          ]
        },
        this.options
      )
      .pipe(
        map(response =>
          delegates.map(delegate => ({
            delegate_value: delegate,
            number_of_delegators: response.filter(tesponseItem => tesponseItem.delegate_value === delegate).length
          }))
        )
      )
  }

  getProposal(id: string): Observable<any> {
    return this.http
      .post<any>(
        this.transactionsApiUrl,
        {
          fields: ['proposal', 'period'],
          predicates: [
            {
              field: 'kind',
              operation: 'eq',
              set: ['proposals'],
              inverse: false
            },
            { field: 'proposal', operation: 'like', set: [id], inverse: false }
          ],
          orderBy: [
            {
              field: 'block_level',
              direction: 'asc'
            }
          ],
          limit: 1
        },
        this.options
      )
      .pipe(map(first))
  }

  getProposals(limit: number, orderBy = { field: 'period', direction: 'desc' }): Observable<ProposalListDto[]> {
    return this.http
      .post<ProposalListDto[]>(
        this.transactionsApiUrl,
        {
          fields: ['proposal', 'operation_group_hash', 'period'],
          predicates: [{ field: 'kind', operation: 'eq', set: ['proposals'], inverse: false }],
          orderBy: [orderBy],
          aggregation: [{ field: 'operation_group_hash', function: 'count' }],
          limit
        },
        this.options
      )
      .pipe(map(proposals => proposals.filter(proposal => proposal.proposal.indexOf(',') === -1)))
  }

  getTransferOperationsForContract(contract: TokenContract, cursor?: TezosTransactionCursor): Observable<TezosTransactionResult> {
    const protocol = this.getFaProtocol(contract)

    return from(protocol.getTransactions(10, cursor))
  }

  getBalanceForLast30Days(accountId: string): Observable<Balance[]> {
    const today = new Date()
    const thirtyDaysInMilliseconds = 1000 * 60 * 60 * 24 * 29 /*30 => predicated condition return 31 days */
    const thirtyDaysAgo = new Date(today.getTime() - thirtyDaysInMilliseconds)

    const isLastItemOfTheMonth = (value: Balance, index: number, array: Balance[]) => {
      if (index === 0) {
        return true
      }

      const current = new Date(value.asof)
      const previous = new Date(array[index - 1].asof)

      if (current.getDay() !== previous.getDay()) {
        return true
      }

      return false
    }

    return this.http
      .post<Balance[]>(
        this.accountHistoryApiUrl,
        {
          fields: ['balance', 'asof'],
          predicates: [
            { field: 'account_id', operation: 'eq', set: [accountId], inverse: false },
            { field: 'asof', operation: 'between', set: [thirtyDaysAgo.getTime(), today.getTime()], inverse: false }
          ],
          orderBy: [{ field: 'asof', direction: 'desc' }],
          limit: 50000
        },
        this.options
      )
      .pipe(
        map(balances => balances.filter(isLastItemOfTheMonth)),
        map(balances =>
          balances.map(balance => ({
            ...balance,
            balance: balance.balance / 1000000 // (1,000,000 mutez = 1 tez/XTZ)
          }))
        ),
        map(balances => balances.sort((a, b) => a.asof - b.asof)),
        map(balances => {
          const dateArray: {
            balance: number
            asof: number
          }[] = []

          let previousBalance: number
          for (let day = 29; day >= 0; day--) {
            const priorDate = new Date(new Date().setDate(new Date().getDate() - day))

            const foundBalance = balances.find(balance => new Date(balance.asof).getDate() === priorDate.getDate())

            if (foundBalance) {
              dateArray.push({
                balance: foundBalance.balance,
                asof: new Date().setDate(new Date().getDate() - day)
              })
              previousBalance = foundBalance.balance
            } else {
              dateArray.push({
                balance: previousBalance ? previousBalance : null,
                asof: new Date().setDate(new Date().getDate() - day)
              })
            }
          }
          return dateArray
        })
      )
  }

  getEarlierBalance(accountId: string, temporaryBalances: Balance[]): Observable<Balance[]> {
    const thirtyDaysInMilliseconds = 1000 * 60 * 60 * 24 * 29 /*30 => predicated condition return 31 days */
    const thirtyDaysAgo = new Date(new Date().getTime() - thirtyDaysInMilliseconds)

    const isLastItemOfTheMonth = (value: Balance, index: number, array: Balance[]) => {
      if (index === 0) {
        return true
      }

      const current = new Date(value.asof)
      const previous = new Date(array[index - 1].asof)

      return current.getDay() !== previous.getDay()
    }

    return this.http
      .post<Balance[]>(
        this.accountHistoryApiUrl,
        {
          fields: ['balance', 'asof'],
          predicates: [
            { field: 'account_id', operation: 'eq', set: [accountId], inverse: false },
            { field: 'asof', operation: 'before', set: [thirtyDaysAgo.getTime()], inverse: false }
          ],
          orderBy: [{ field: 'asof', direction: 'desc' }],
          limit: 1
        },
        this.options
      )
      .pipe(
        map(balances => balances.filter(isLastItemOfTheMonth)),
        map(balances =>
          balances.map(balance => ({
            ...balance,
            balance: balance.balance / 1000000 // (1,000,000 mutez = 1 tez/XTZ)
          }))
        ),
        map(balances => {
          const copiedBalances = JSON.parse(JSON.stringify(temporaryBalances))
          if (balances.length === 0) {
            copiedBalances[0].balance = 0
          } else {
            copiedBalances[0] = balances[0]
          }

          let previousBalance = copiedBalances[0].balance
          for (let index = 0; index <= 29; index++) {
            if (!copiedBalances[index].balance && (previousBalance || previousBalance === 0)) {
              copiedBalances[index].balance = previousBalance
            } else if (copiedBalances[index].balance) {
              previousBalance = copiedBalances[index].balance
            }
          }

          return copiedBalances
        })
      )
  }

  getTotalSupplyByContract(contract: TokenContract): Observable<string> {
    const protocol = this.getFaProtocol(contract)

    return from(protocol.getTotalSupply())
  }

  getErrorsForOperations(operations: Transaction[]): Observable<OperationErrorsById[]> {
    const distinctBlockLevels = operations.map(operation => operation.block_level).filter(distinctFilter)
    const contentWithError = (content: RPCContent): boolean =>
      _.get(content, 'metadata.operation_result.errors') ||
      get<{ result: { errors?: OperationError[] } }[]>(internal_operation_results =>
        internal_operation_results.some(internal_operation_result => !!internal_operation_result.result.errors)
      )(_.get(content, 'metadata.internal_operation_results'))
    const hasError = (rpcBlocksOpertions: RPCBlocksOpertions): boolean =>
      rpcBlocksOpertions.contents && rpcBlocksOpertions.contents.some(contentWithError)
    const contentToErrors = (content: RPCContent): OperationError[] =>
      content.metadata
        ? (_.get(content, 'metadata.operation_result.errors') || []).concat(
            content.metadata.internal_operation_results
              ? flatten(
                  content.metadata.internal_operation_results
                    .filter(internal_operation_result => !!internal_operation_result.result.errors)
                    .map(internal_operation_result => internal_operation_result.result.errors)
                )
              : []
          )
        : []

    return forkJoin(
      distinctBlockLevels.map(blockLevel =>
        this.http.get<any[]>(`${this.environmentUrls.rpcUrl}/chains/main/blocks/${blockLevel}/operations`)
      )
    ).pipe(
      map<any[][][], any[][]>(flatten), //forkJoin
      map(flatten), //http.get
      map((rpcBlocksOpertions: RPCBlocksOpertions[]) =>
        operations.map(operation => {
          const match = rpcBlocksOpertions.filter(
            rpcBlocksOpertion => rpcBlocksOpertion.hash === operation.operation_group_hash && hasError(rpcBlocksOpertion)
          )

          return {
            id: operation.operation_group_hash,
            errors: match.length > 0 ? flatten(match.map(item => flatten(item.contents.map(contentToErrors)))) : null
          }
        })
      ),
      map(x => {
        return x //TODO remove this map
      })
    )
  }

  private getFaProtocol(contract: TokenContract): TezosFAProtocol {
    return new TezosFAProtocol({
      symbol: contract.symbol,
      name: contract.name,
      marketSymbol: contract.symbol,
      identifier: '', // not important in this context can be empty string
      contractAddress: contract.id,
      jsonRPCAPI: this.environmentUrls.rpcUrl,
      baseApiUrl: this.environmentUrls.conseilUrl,
      baseApiKey: this.environmentUrls.conseilApiKey,
      baseApiNetwork: this.chainNetworkService.getEnvironmentVariable(),
      network: this.chainNetworkService.getNetwork(),
      feeDefaults: {
        low: '0',
        medium: '0',
        high: '0'
      }
    })
  }
}
