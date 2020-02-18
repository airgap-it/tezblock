import { BigNumber } from 'bignumber.js'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { Observable, of, pipe, from, forkJoin, combineLatest } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { TezosProtocol, TezosFAProtocol, TezosTransactionResult, TezosTransactionCursor } from 'airgap-coin-lib'

import { AggregatedBakingRights, BakingRights, getEmptyAggregatedBakingRight } from '@tezblock/interfaces/BakingRights'
import { EndorsingRights, AggregatedEndorsingRights, getEmptyAggregatedEndorsingRight } from '@tezblock/interfaces/EndorsingRights'
import { Account } from '@tezblock/interfaces/Account'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { VotingInfo, VotingPeriod } from '@tezblock/domain/vote'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { distinctFilter, first, get, groupBy, last } from '@tezblock/services/fp'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { Predicate, Operation, OrderBy } from '../base.service'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { Contract } from '@tezblock/domain/contract'
import { sort } from '@tezblock/domain/table'

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

  getAccountsStartingWith(id: string): Observable<Object[]> {
    const result: Object[] = []

    Object.keys(accounts).forEach(account => {
      if (accounts[account] && accounts[account].alias && accounts[account].alias.toLowerCase().startsWith(id.toLowerCase())) {
        result.push({ name: accounts[account].alias, type: 'Bakers' })
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
                      blockRewards: reward.bakingRewards,
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
          map((aggregatedRights: AggregatedBakingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle)),
          map(ensureCycle(first(cycles), getEmptyAggregatedBakingRight))
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
                      endorsementRewards: reward.endorsingRewards,
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
          map((aggregatedRights: AggregatedEndorsingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle)),
          map(ensureCycle(first(cycles), getEmptyAggregatedEndorsingRight))
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
          orderBy: [sort('block_level', 'desc')],
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
          predicates: [{ field: 'proposal', operation: 'eq', set: [id], inverse: false }],
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

  getTransferOperationsForContract(contract: Contract, cursor?: TezosTransactionCursor): Observable<TezosTransactionResult> {
    const protocol = this.getFaProtocol(contract)

    return from(protocol.getTransactions(10, cursor))
  }

  getBalanceForLast30Days(accountId: string): Observable<Balance[]> {
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

  getTotalSupplyByContract(contract: Contract): Observable<string> {
    const protocol = this.getFaProtocol(contract)

    return from(protocol.getTotalSupply())
  }

  private getFaProtocol(contract: Contract): TezosFAProtocol {
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
      network: this.chainNetworkService.getNetwork()
    })
  }
}
