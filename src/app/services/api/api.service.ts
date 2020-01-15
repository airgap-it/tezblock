import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { Observable, of, pipe, from, forkJoin } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { AggregatedBakingRights, BakingRights } from './../../interfaces/BakingRights'
import { EndorsingRights, AggregatedEndorsingRights } from './../../interfaces/EndorsingRights'
import { Account } from '../../interfaces/Account'
import { Block } from '../../interfaces/Block'
import { Transaction } from '../../interfaces/Transaction'
import { VotingInfo } from '../transaction-single/transaction-single.service'
import { TezosProtocol } from 'airgap-coin-lib'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { first, get, groupBy, last } from '@tezblock/services/fp'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { Predicate } from '../base.service'

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
  public environmentUrls = this.chainNetworkService.getEnvironment()
  public environmentVariable = this.chainNetworkService.getEnvironmentVariable()
  public protocol: TezosProtocol

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
    public readonly chainNetworkService: ChainNetworkService,
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

  public getCurrentCycleRange(currentCycle: number): Observable<Block[]> {
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

  public getLatestTransactions(limit: number, kindList: Array<string>): Observable<Transaction[]> {
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
        switchMap(transactions => {
          // TODO: refactor addVotesForTransaction to accept list of transactions
          if (kindList.includes('ballot' || 'proposals')) {
            return forkJoin(
              forkJoin(transactions.map(transaction => this.getVotingPeriod(transaction.block_level))),
              forkJoin(transactions.map(transaction => this.getVotesForTransaction(transaction)))
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

  public getTransactionsById(id: string, limit: number): Observable<Transaction[]> {
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
        switchMap((transactions: Transaction[]) => {
          const votes = transactions.filter(transaction => ['ballot', 'proposals'].indexOf(transaction.kind) !== -1)

          if (votes.length > 0) {
            // TODO: refactor addVotesForTransaction to accept list of transactions
            return forkJoin(
              forkJoin(transactions.map(transaction => this.getVotingPeriod(transaction.block_level))),
              forkJoin(transactions.map(transaction => this.getVotesForTransaction(transaction)))
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

  public getEndorsementsById(id: string, limit: number): Observable<Transaction[]> {
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

  public getTransactionsByBlock(blockHash: string, limit: number): Observable<Transaction[]> {
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

  public getTransactionsByField(value: string, field: string, kind: string, limit: number): Observable<Transaction[]> {
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
      .pipe(
        map((transactions: Transaction[]) => {
          let finalTransactions: Transaction[] = []
          finalTransactions = transactions.slice(0, limit)
          const sources = []
          const originatedAccounts = []

          finalTransactions.forEach(transaction => {
            if (transaction.kind === 'delegation') {
              sources.push(transaction.source)
            } else if (transaction.kind === 'origination') {
              originatedAccounts.push(transaction.originated_contracts)
            }
          })

          if (sources.length > 0) {
            const delegateSources = this.getAccountsByIds(sources)
            delegateSources.subscribe(delegators => {
              finalTransactions.forEach(transaction => {
                delegators.forEach(delegator => {
                  if (transaction.source === delegator.account_id) {
                    transaction.delegatedBalance = delegator.balance
                  }
                })
              })
            })
          }
          if (originatedAccounts.length > 0) {
            const originatedSources = this.getAccountsByIds(originatedAccounts)
            originatedSources.subscribe(originators => {
              finalTransactions.forEach(transaction => {
                originators.forEach(originator => {
                  if (transaction.originated_contracts === originator.account_id) {
                    transaction.originatedBalance = originator.balance
                  }
                })
              })
            })
          }

          return finalTransactions
        })
      )
  }

  public getLatestAccounts(limit: number): Observable<Account[]> {
    return this.http.post<Account[]>(
      this.accountsApiUrl,
      {
        limit
      },
      this.options
    )
  }

  public getById(id: string): Observable<Object> {
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

  public getAccountById(id: string): Observable<Account[]> {
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
  public getAccountsByIds(ids: string[]): Observable<Account[]> {
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

  public getAccountsStartingWith(id: string): Observable<Object[]> {
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

  public getTransactionHashesStartingWith(id: string): Observable<Object[]> {
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

  public getBlockHashesStartingWith(id: string): Observable<Object[]> {
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

  public getDelegatedAccounts(address: string, limit: number): Observable<Transaction[]> {
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

  public getManagerAccount(ktAddress: string, limit: number): Observable<Account[]> {
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

  public getAccountStatus(address: string): Promise<string> {
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

  public getLatestBlocks(limit: number): Observable<Block[]> {
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

  public getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string, limit: number): Promise<T[]> {
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

  public getOperationCount(field: string, value: string): Observable<OperationCount[]> {
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

  public getBlockById(id: string): Observable<Block[]> {
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

  public getBlockByHash(hash: string): Observable<Block[]> {
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

  // TODO: remove (replace by getVotesForTransaction)
  public async addVotesForTransaction(transaction: Transaction): Promise<Transaction> {
    return new Promise(async resolve => {
      const data = await this.protocol.getTezosVotingInfo(transaction.block_hash)
      const votingInfo = data.find((element: VotingInfo) => element.pkh === transaction.source)
      transaction.votes = votingInfo ? votingInfo.rolls : null
      resolve(transaction)
    })
  }

  public getVotesForTransaction(transaction: Transaction): Observable<number> {
    return from(this.protocol.getTezosVotingInfo(transaction.block_hash)).pipe(
      map(data => {
        const votingInfo = data.find((element: VotingInfo) => element.pkh === transaction.source)

        return votingInfo ? votingInfo.rolls : null
      })
    )
  }

  public getCurrentCycle(): Observable<number> {
    return from(this.protocol.fetchCurrentCycle())
  }

  public getBakingRights(address: string, limit?: number, predicates?: Predicate[]): Observable<BakingRights[]> {
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
            operation: 'gt',
            set: [minLevel]
          },
          {
            field: 'level',
            operation: 'lt',
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
                from(this.protocol.calculateRewards(address, aggregatedRight.cycle)).pipe(
                  map(reward => {
                    const rewardByLabel = reward.bakingRewardsDetails.reduce(
                      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue.amount), accumulator),
                      {}
                    )

                    return {
                      ...aggregatedRight,
                      blockRewards: reward.totalRewards,
                      items: aggregatedRight.items.map(item => ({
                        ...item,
                        rewards: rewardByLabel[item.level]
                      }))
                    }
                  })
                )
              )
            )
          })
        )
      })
    )
  }

  public getEndorsingRights(address: string, limit?: number, predicates?: Predicate[]): Observable<EndorsingRights[]> {
    const _predicates = (<Predicate[]>[
      {
        field: 'delegate',
        operation: 'eq',
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
            operation: 'gt',
            set: [minLevel]
          },
          {
            field: 'level',
            operation: 'lt',
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
                from(this.protocol.calculateRewards(address, aggregatedRight.cycle)).pipe(
                  map(reward => {
                    const rewardByLabel = reward.endorsingRewardsDetails.reduce(
                      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue.amount), accumulator),
                      {}
                    )

                    return {
                      ...aggregatedRight,
                      endorsementRewards: reward.totalRewards,
                      items: aggregatedRight.items.map(item => ({
                        ...item,
                        rewards: rewardByLabel[item.level]
                      }))
                    }
                  })
                )
              )
            )
          })
        )
      })
    )
  }

  public getEndorsedSlotsCount(blockHash: string): Observable<number> {
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

  public getFrozenBalance(tzAddress: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http
        .post(
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
          resolve(result[0].frozen_balance)
        })
    })
  }

  public getDelegatedAccountsList(tzAddress: string): Observable<any> {
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
  public getVotingPeriod(block_level: number): Observable<string> {
    return this.http
      .post<Block[]>(
        this.blocksApiUrl,
        {
          fields: ['level', 'period_kind'],
          predicates: [
            {
              field: 'level',
              operation: 'eq',
              set: [block_level.toString()],
              inverse: false
            }
          ]
        },
        this.options
      )
      .pipe(
        map(
          pipe(
            first,
            get(_first => _first.period_kind)
          )
        )
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
