import { BigNumber } from 'bignumber.js'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { Observable, of, pipe, from, forkJoin } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { TezosProtocol, TezosFAProtocol, TezosTransactionResult, TezosTransactionCursor } from 'airgap-coin-lib'

import { AggregatedBakingRights, BakingRights } from './../../interfaces/BakingRights'
import { EndorsingRights, AggregatedEndorsingRights } from './../../interfaces/EndorsingRights'
import { Account } from '../../interfaces/Account'
import { Block } from '../../interfaces/Block'
import { Transaction } from '../../interfaces/Transaction'
import { VotingInfo, VotingPeriod } from '@tezblock/domain/vote'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { distinctFilter, first, get, groupBy, last } from '@tezblock/services/fp'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { Predicate, Operation } from '../base.service'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { Contract } from '@tezblock/domain/contract'

export interface OperationCount {
  [key: string]: string
  count_operation_group_hash: string
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

  private readonly orderByTimestampAsc = {
    field: 'timestamp',
    direction: 'asc'
  }

  private readonly orderByBlockLevelDesc = {
    field: 'block_level',
    direction: 'desc'
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
        orderBy: [this.orderByTimestampAsc],
        limit: 1
      },
      this.options
    )
  }

  getLatestTransactions(limit: number, kindList: string[]): Observable<Transaction[]> {
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
          orderBy: [this.orderByBlockLevelDesc],
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

  getTransactionsById(id: string, limit: number): Observable<Transaction[]> {
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

    if (kindList.includes('ballot' || 'proposals')) {
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
        orderBy: [
          {
            field: 'block_level',
            direction: 'desc'
          }
        ],
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
    sortingValue?: string,
    sortingDirection?: string
  ): Observable<Transaction[]> {
    let orderBy = {
      field: 'block_level',
      direction: 'desc'
    }
    let delegatedOriginatedMemory: string
    if (sortingValue && sortingDirection) {
      if (sortingValue === 'originatedBalance' || sortingValue === 'delegatedBalance') {
        delegatedOriginatedMemory = sortingValue
        orderBy = {
          field: 'block_level',
          direction: 'desc'
        }
      } else {
        orderBy = { field: sortingValue, direction: sortingDirection }
      }
    }
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
          sortingValue && sortingDirection
            ? sortingValue === 'delegatedBalance' || sortingValue === 'originatedBalance'
              ? sortingDirection === 'desc'
                ? (transactions = transactions.sort((a, b) => b.delegatedBalance - a.delegatedBalance)) // tslint:disable
                : (transactions = transactions.sort((a, b) => a.delegatedBalance - b.delegatedBalance)) // tslint:disable
              : transactions
            : (transactions = transactions.sort((a, b) => b.block_level - a.block_level).slice(0, limit))

          return of(transactions)
        })
      )
  }

  getTransactionsByPredicates(
    predicates: Predicate[],
    limit: number,
    orderBy?: {
      field: string
      direction: string
    }
  ): Observable<Transaction[]> {
    let postRequest = this.http.post<Transaction[]>(
      this.transactionsApiUrl,
      {
        predicates: [...predicates],
        orderBy: [
          {
            field: 'block_level',
            direction: 'desc'
          }
        ],
        limit
      },
      this.options
    )
    if (orderBy) {
      if (orderBy.field === 'originatedBalance' || orderBy.field === 'delegatedBalance') {
        orderBy = {
          field: 'block_level',
          direction: 'desc'
        }
      }
      postRequest = this.http.post<Transaction[]>(
        this.transactionsApiUrl,
        {
          predicates: [...predicates],
          orderBy: [orderBy],
          limit
        },
        this.options
      )
    }
    return postRequest.pipe(
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

  getById(id: string): Observable<Object> {
    this.getDelegatedAccounts(id, 10)

    return this.http.post(
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

  getAccountsStartingWith(id: string): Observable<Object[]> {
    const result: Object[] = []
    Object.keys(accounts).forEach(baker => {
      if (accounts[baker] && accounts[baker].alias && accounts[baker].alias.toLowerCase().startsWith(id.toLowerCase())) {
        result.push({ name: accounts[baker].alias, type: 'Bakers' })
      }
    })
    if (result.length === 0) {
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
          map(accounts =>
            accounts.map(account => {
              return { name: account.account_id, type: 'Accounts' }
            })
          )
        )
    }

    return of(result)
  }

  getTransactionHashesStartingWith(id: string): Observable<Object[]> {
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
            return { name: item.operation_group_hash, type: 'Transactions' }
          })
        )
      )
  }

  getBlockHashesStartingWith(id: string): Observable<Object[]> {
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
            return { name: item.hash, type: 'Blocks' }
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
            orderBy: [
              {
                field: 'block_level',
                direction: 'desc'
              }
            ],
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

  getLatestBlocks(limit: number): Observable<Block[]> {
    return this.http.post<Block[]>(
      this.blocksApiUrl,
      {
        orderBy: [
          {
            field: 'timestamp',
            direction: 'desc'
          }
        ],
        limit
      },
      this.options
    )
  }

  getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string, limit: number): Promise<T[]> {
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
        orderBy: [
          {
            field: 'block_level',
            direction: 'desc'
          }
        ],
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
        orderBy: [
          {
            field: 'block_level',
            direction: 'desc'
          }
        ],
        aggregation: [
          {
            field,
            function: operation
          }
        ],
        limit
      }
    }

    return new Promise((resolve, reject) => {
      this.http.post<T[]>(this.transactionsApiUrl, headers, this.options).subscribe((volumePerBlock: T[]) => {
        resolve(volumePerBlock)
      })
    })
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

    return this.http.post<OperationCount[]>(this.transactionsApiUrl, body, this.options)
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

  getCurrentCycle(): Observable<number> {
    return from(this.protocol.fetchCurrentCycle())
  }

  getBakingRights(address: string, limit?: number, predicates?: Predicate[]): Observable<BakingRights[]> {
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
    const group = groupBy('cycle')

    return this.rewardService.getLastCycles({ selectedSize: limit, currentPage: 0 }).pipe(
      switchMap(cycles => {
        const minLevel = cycleToLevel(last(cycles))
        const maxLevel = cycleToLevel(first(cycles) + 1)
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

        return this.getBakingRights(address, null, predicates).pipe(
          map((rights: BakingRights[]) => rights.map(addCycleFromLevel)),
          map((rights: BakingRights[]) =>
            Object.entries(group(rights)).map(
              ([cycle, items]) =>
                <AggregatedBakingRights>{
                  cycle: parseInt(cycle),
                  bakingsCount: (<any[]>items).length,
                  blockRewards: undefined,
                  deposits: undefined,
                  fees: undefined,
                  items
                }
            )
          ),
          switchMap((aggregatedRights: AggregatedBakingRights[]) => {
            return forkJoin(
              aggregatedRights.map(aggregatedRight =>
                from(this.rewardService.calculateRewards(address, aggregatedRight.cycle)).pipe(
                  map((reward: TezosRewards) => {
                    const rewardByLevel = reward.bakingRewardsDetails.reduce(
                      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue), accumulator),
                      {}
                    )
                    return {
                      ...aggregatedRight,
                      blockRewards: reward.totalRewards,
                      deposits: reward.bakingDeposits,
                      fees: new BigNumber(reward.fees).toNumber(),
                      items: aggregatedRight.items.map(item => ({
                        ...item,
                        rewards: rewardByLevel[item.level] ? rewardByLevel[item.level].amount : '0',
                        deposit: rewardByLevel[item.level] ? rewardByLevel[item.level].deposit : '0',
                        fees: rewardByLevel[item.level] ? rewardByLevel[item.level].fees : '0'
                      }))
                    }
                  })
                )
              )
            )
          }),
          map((aggregatedRights: AggregatedBakingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle))
        )
      })
    )
  }

  getEndorsingRights(address: string, limit?: number, predicates?: Predicate[]): Observable<EndorsingRights[]> {
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
    const group = groupBy('cycle')

    return this.rewardService.getLastCycles({ selectedSize: limit, currentPage: 0 }).pipe(
      switchMap(cycles => {
        const minLevel = cycleToLevel(last(cycles))
        const maxLevel = cycleToLevel(first(cycles) + 1)
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

        return this.getEndorsingRights(address, 30000, predicates).pipe(
          map((rights: EndorsingRights[]) => rights.map(addCycleFromLevel)),
          map((rights: EndorsingRights[]) =>
            Object.entries(group(rights)).map(
              ([cycle, items]) =>
                <AggregatedEndorsingRights>{
                  cycle: parseInt(cycle),
                  endorsementsCount: (<any[]>items).length,
                  endorsementRewards: undefined,
                  deposits: undefined,
                  items
                }
            )
          ),
          switchMap((aggregatedRights: AggregatedEndorsingRights[]) => {
            return forkJoin(
              aggregatedRights.map(aggregatedRight =>
                from(this.rewardService.calculateRewards(address, aggregatedRight.cycle)).pipe(
                  map((reward: TezosRewards) => {
                    const rewardByLevel = reward.endorsingRewardsDetails.reduce(
                      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue), accumulator),
                      {}
                    )

                    return {
                      ...aggregatedRight,
                      endorsementRewards: reward.totalRewards,
                      deposits: reward.endorsingDeposits,
                      items: aggregatedRight.items.map(item => ({
                        ...item,
                        rewards: rewardByLevel[item.level] ? rewardByLevel[item.level].amount : '0',
                        deposit: rewardByLevel[item.level] ? rewardByLevel[item.level].deposit : '0'
                      }))
                    }
                  })
                )
              )
            )
          }),
          map((aggregatedRights: AggregatedEndorsingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle))
        )
      })
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
          orderBy: [
            {
              field: 'block_level',
              direction: 'desc'
            }
          ],
          limit: 32
        },
        this.options
      )
      .pipe(map((transactions: Transaction[]) => _.flatten(transactions.map(transaction => JSON.parse(transaction.slots))).length))
  }

  getFrozenBalance(tzAddress: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http
        .post<any[]>(
          this.delegatesApiUrl,
          {
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
        .subscribe(result => {
          resolve(
            pipe<any[], any, number>(
              first,
              get(_first => _first.frozen_balance)
            )(result)
          )
        })
    })
  }

  getDelegatedAccountsList(tzAddress: string): Observable<any> {
    return this.http.post(
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

  getActiveBakers(limit: number): Observable<Baker[]> {
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
        orderBy: [{ field: 'staking_balance', direction: 'desc' }],
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
          predicates: [{ field: 'proposal', operation: 'eq', set: [id], inverse: false }],
          limit: 1
        },
        this.options
      )
      .pipe(map(first))
  }

  getProposals(limit: number): Observable<ProposalListDto[]> {
    return this.http
      .post<ProposalListDto[]>(
        this.transactionsApiUrl,
        {
          fields: ['proposal', 'operation_group_hash', 'period'],
          predicates: [{ field: 'kind', operation: 'eq', set: ['proposals'], inverse: false }],
          orderBy: [{ field: 'period', direction: 'desc' }],
          aggregation: [{ field: 'operation_group_hash', function: 'count' }],
          limit
        },
        this.options
      )
      .pipe(map(proposals => proposals.filter(proposal => proposal.proposal.indexOf(',') === -1)))
  }

  getTransferOperationsForContract(contract: Contract, cursor?: TezosTransactionCursor): Observable<TezosTransactionResult> {
    const protocol = new TezosFAProtocol({
      symbol: contract.symbol,
      name: contract.name,
      marketSymbol: contract.symbol,
      identifier: '', // not important in this context can be empty string
      contractAddress: contract.id,
      jsonRPCAPI: this.environmentUrls.rpcUrl,
      baseApiUrl: this.environmentUrls.conseilUrl,
      baseApiKey: this.environmentUrls.conseilApiKey,
      baseApiNetwork: this.chainNetworkService.getEnvironmentVariable(),
      network: this.chainNetworkService.getNetwork()
    })

    return from(protocol.getTransactions(10, cursor))
  }

  public getBalanceForLast30Days(accountId: string): Observable<Balance[]> {
    const today = new Date()
    const thirtyDaysInMilliseconds = 1000 * 60 * 60 * 24 * 29 /*30 => predicated condition return 31 days */
    const thirtyDaysAgo = new Date(today.getTime() - thirtyDaysInMilliseconds)
    const lastItemOfTheDay = (value: Balance, index: number, array: Balance[]) => {
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
        map(delegations => delegations.filter(lastItemOfTheDay)),
        map(delegations =>
          delegations.map(delegation => ({
            ...delegation,
            balance: delegation.balance / 1000000 // (1,000,000 mutez = 1 tez/XTZ)
          }))
        ),
        map(delegations => delegations.sort((a, b) => a.asof - b.asof))
      )
  }
}
