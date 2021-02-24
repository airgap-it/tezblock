import { BigNumber } from 'bignumber.js'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { Observable, of, pipe, from, forkJoin, combineLatest } from 'rxjs'
import { map, switchMap, filter, tap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { isNil, negate, get as _get } from 'lodash'

import { AggregatedBakingRights, BakingRights, getEmptyAggregatedBakingRight, BakingRewardsDetail } from '@tezblock/interfaces/BakingRights'
import {
  EndorsingRights,
  AggregatedEndorsingRights,
  getEmptyAggregatedEndorsingRight,
  EndorsingRewardsDetail
} from '@tezblock/interfaces/EndorsingRights'
import { Account } from '@tezblock/domain/account'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { distinctFilter, first, get, flatten } from '@tezblock/services/fp'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { Predicate, Operation, Options } from '../base.service'
import { EnvironmentUrls } from '@tezblock/domain/generic/environment-urls'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { TokenContract } from '@tezblock/domain/contract'
import { sort } from '@tezblock/domain/table'
import { RPCBlocksOpertions, RPCContent, OperationErrorsById, OperationError, OperationTypes } from '@tezblock/domain/operations'
import { SearchOptionData } from '@tezblock/services/search/model'
import { getFaProtocol, getTezosProtocol, xtzToMutezConvertionRatio } from '@tezblock/domain/airgap'
import { CacheService, CacheKeys, ByAddressState, ByProposalState, ByCycle } from '@tezblock/services/cache/cache.service'
import { squareBrackets } from '@tezblock/domain/pattern'
import * as fromRoot from '@tezblock/reducers'
import * as fromApp from '@tezblock/app.reducer'
import { ProtocolConstantResponse } from '@tezblock/services/protocol-variables/protocol-variables.service'
import { ProposalService } from '@tezblock/services/proposal/proposal.service'
import { AccountService } from '@tezblock/services/account/account.service'
import { getRightStatus } from '@tezblock/domain/reward'
import { TezosProtocol, TezosTransactionCursor, TezosTransactionResult } from '@airgap/coinlib-core'
import { TezosRewards } from '@airgap/coinlib-core/protocols/tezos/TezosProtocol'

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

const cycleToLevel = (cycle: number, blocksPerCycle: number): number => cycle * blocksPerCycle
export const addCycleFromLevel = (blocksPerCycle: number) => right => ({ ...right, level: right.block_level, cycle: Math.floor(right.block_level / blocksPerCycle) })

function ensureCycle<T extends { cycle: number }>(cycle: number, factory: () => T) {
  return (rights: T[]): T[] => (rights.some(right => right.cycle === cycle) ? rights : [{ ...factory(), cycle }].concat(rights))
}

const getRightCycles = (currentCycle: number, limit: number): number[] =>
  _.range(0, limit)
    .map(index => currentCycle + 3 - index)
    .sort((a, b) => b - a)

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  environmentUrls: EnvironmentUrls
  environmentVariable: string
  protocol: TezosProtocol

  private bakingRightsApiUrl: string
  private endorsingRightsApiUrl: string
  private blocksApiUrl: string
  private transactionsApiUrl: string
  private accountsApiUrl: string
  private delegatesApiUrl: string
  private accountHistoryApiUrl: string
  private options: Options

  constructor(
    private readonly accountService: AccountService,
    private readonly cacheService: CacheService,
    private readonly http: HttpClient,
    readonly chainNetworkService: ChainNetworkService,
    private readonly proposalService: ProposalService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>
  ) {
    const network = chainNetworkService.getNetwork()

    this.environmentUrls = chainNetworkService.getEnvironment()
    this.environmentVariable = chainNetworkService.getEnvironmentVariable()
    this.protocol = getTezosProtocol(this.environmentUrls, network)
    this.setProperties()
  }

  // method created to ease testing
  private getUrl(domain: string): string {
    return `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/${domain}`
  }

  private setProperties() {
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        apikey: this.environmentUrls.conseilApiKey
      })
    }
    this.bakingRightsApiUrl = this.getUrl('baking_rights')
    this.endorsingRightsApiUrl = this.getUrl('endorsing_rights')
    this.blocksApiUrl = this.getUrl('blocks')
    this.transactionsApiUrl = this.getUrl('operations')
    this.accountsApiUrl = this.getUrl('accounts')
    this.delegatesApiUrl = this.getUrl('bakers') /* delegates (previously) */
    this.accountHistoryApiUrl = this.getUrl('accounts_history')
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
            return this.accountService.getAccountsByIds(originatedAccounts).pipe(
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
        switchMap((transactions: Transaction[]) => this.proposalService.addVoteData(transactions, kindList))
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
        switchMap((transactions: Transaction[]) => this.fillDelegatedBalance(transactions)),
        switchMap((transactions: Transaction[]) => this.fillOriginatedBalance(transactions)),
        switchMap((transactions: Transaction[]) => this.proposalService.addVoteData(transactions))
      )
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
        switchMap((transactions: Transaction[]) => this.fillDelegatedBalance(transactions)),
        switchMap((transactions: Transaction[]) => this.fillOriginatedBalance(transactions))
      )
  }

  private fillDelegatedBalance(transactions: Transaction[]): Observable<Transaction[]> {
    const sources = transactions.filter(transaction => transaction.kind === 'delegation').map(transaction => transaction.source)

    if (sources.length > 0) {
      return this.accountService.getAccountsByIds(sources).pipe(
        map((accounts: Account[]) =>
          transactions.map(transaction => {
            const match = accounts.find(account => account.account_id === transaction.source)

            return match ? { ...transaction, delegatedBalance: match.balance } : transaction
          })
        )
      )
    }

    return of(transactions)
  }

  private fillOriginatedBalance(transactions: Transaction[]): Observable<Transaction[]> {
    const originatedAccounts = transactions
      .filter(transaction => transaction.kind === 'origination')
      .map(transaction => transaction.originated_contracts)

    if (originatedAccounts.length > 0) {
      return this.accountService.getAccountsByIds(originatedAccounts).pipe(
        map((accounts: Account[]) =>
          transactions.map(transaction => {
            const match = accounts.find(account => account.account_id === transaction.originated_contracts)

            return match ? { ...transaction, originatedBalance: match.balance } : transaction
          })
        )
      )
    }

    return of(transactions)
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
        switchMap((transactions: Transaction[]) => this.fillDelegatedBalance(transactions)),
        switchMap((transactions: Transaction[]) => this.fillOriginatedBalance(transactions))
      )
  }

  getTransactionHashesStartingWith(id: string): Observable<SearchOptionData[]> {
    return this.http
      .post<Transaction[]>(
        this.transactionsApiUrl,
        {
          fields: ['operation_group_hash', 'kind'],
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
            return {
              id: item.operation_group_hash,
              type: item.kind === OperationTypes.Endorsement ? OperationTypes.Endorsement : OperationTypes.Transaction
            }
          })
        )
      )
  }

  getBlockHashesStartingWith(id: string): Observable<SearchOptionData[]> {
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
            return { id: item.level.toString(), type: OperationTypes.Block }
          })
        )
      )
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
          const amountObservable$ = this.getAdditionalBlockField(blockRange, 'amount', 'sum', limit)
          const feeObservable$ = this.getAdditionalBlockField(blockRange, 'fee', 'sum', limit)
          const operationGroupObservable$ = this.getAdditionalBlockField(blockRange, 'operation_group_hash', 'count', limit)

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

  getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string, limit?: number): Observable<T[]> {
    const body = {
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
      ].concat(
        field === 'operation_group_hash'
          ? <any>{
            field: 'kind',
            operation: 'in',
            set: ['transaction']
          }
          : []
      ),
      orderBy: [sort('block_level', 'desc')],
      aggregation: [
        {
          field,
          function: operation
        }
      ],
      limit
    }

    return this.http.post<T[]>(this.transactionsApiUrl, body, this.options)
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

  getTokenTransferCount(address: string, supportedTokens: TokenContract[]): Observable<OperationCount[]> {
    const body = {
      fields: ['source', 'kind'],
      predicates: [
        {
          field: "operation_group_hash",
          operation: "isnull",
          inverse: true
        },
        {
          field: "kind",
          operation: "eq",
          set: ['transaction'],
          inverse: false
        },
        {
          field: 'parameters_micheline',
          operation: 'like',
          set: [address],
          inverse: false
        },
        {
          field: 'destination',
          operation: 'in',
          set: supportedTokens.map(contract => contract.id),
          inverse: false
        }
      ],
      aggregation: [
        {
          field: 'source',
          function: 'count'
        }
      ]
    }

    return this.http
      .post<OperationCount[]>(this.transactionsApiUrl, body, this.options)
      .pipe(map(operationCounts => operationCounts.map(operationCount => ({ ...operationCount, field: 'source' }))))
  }

  getBlockByLevel(level: string): Observable<Block> {
    return this.http
      .post<Block[]>(
        this.blocksApiUrl,
        {
          predicates: [
            {
              field: 'level',
              operation: 'eq',
              set: [level],
              inverse: false
            }
          ],
          limit: 1
        },
        this.options
      )
      .pipe(map(first))
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

  getBlockByHash(hash: string): Observable<Block> {
    return this.http
      .post<Block[]>(
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
      .pipe(map(first))
  }

  private getBakingRights(address: string, blocksPerCycle: number, limit?: number, predicates?: Predicate[]): Observable<BakingRights[]> {
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
              field: 'block_level',
              direction: 'desc'
            }
          ],
          limit: limit
        },
        this.options
      )
      .pipe(map((rights: BakingRights[]) => rights.map(addCycleFromLevel(blocksPerCycle))))
  }

  getAggregatedBakingRights(address: string, limit: number): Observable<AggregatedBakingRights[]> {
    return this.rewardService.getCurrentCycle().pipe(
      switchMap(currentCycle => {
        const cycles = getRightCycles(currentCycle, limit)

        return forkJoin(
          cycles.map(cycle =>
            from(this.rewardService.calculateRewards(address, cycle)).pipe(
              map((reward: TezosRewards) => ({
                cycle,
                bakingsCount: reward.bakingRewardsDetails.length,
                blockRewards: reward.bakingRewards,
                deposits: reward.bakingDeposits,
                fees: new BigNumber(reward.fees).toNumber(),
                bakingRewardsDetails: reward.bakingRewardsDetails,
                rightStatus: getRightStatus(currentCycle, cycle)
              }))
            )
          )
        ).pipe(
          map((aggregatedRights: AggregatedBakingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle)),
          map(ensureCycle(first(cycles), getEmptyAggregatedBakingRight))
        )
      })
    )
  }

  getBakingRightsItems(address: string, cycle: number, bakingRewardsDetails: BakingRewardsDetail[]): Observable<BakingRights[]> {
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

    return this.store$
      .select(state => state.app.protocolVariables)
      .pipe(
        filter(negate(isNil)),
        map((protocolVariables: ProtocolConstantResponse) => protocolVariables.blocks_per_cycle),
        switchMap(blocks_per_cycle => {
          const minLevel = cycleToLevel(cycle, blocks_per_cycle)
          const maxLevel = cycleToLevel(cycle + 1, blocks_per_cycle)
          const predicates = [
            {
              field: 'block_level',
              operation: Operation.gt,
              set: [minLevel]
            },
            {
              field: 'block_level',
              operation: Operation.lt,
              set: [maxLevel]
            }
          ]

          return this.getBakingRights(address, blocks_per_cycle, null, predicates).pipe(
            map((rights: BakingRights[]) => rights.map(addCycleFromLevel(blocks_per_cycle))),
            map((rights: BakingRights[]) => rights.map(setRewardsDepositsAndFees))
          )
        })
      )
  }

  private getEndorsingRights(
    address: string,
    blocksPerCycle: number,
    limit?: number,
    predicates?: Predicate[]
  ): Observable<EndorsingRights[]> {
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
          fields: ['block_level', 'slot', 'estimated_time'],
          predicates: _predicates,
          orderBy: [
            {
              field: 'block_level',
              direction: 'desc'
            }
          ],
          limit: limit
        },
        this.options
      )
      .pipe(map((rights: EndorsingRights[]) => rights.map(addCycleFromLevel(blocksPerCycle))))
  }

  getAggregatedEndorsingRights(address: string, limit: number): Observable<AggregatedEndorsingRights[]> {
    return this.rewardService.getCurrentCycle().pipe(
      switchMap(currentCycle => {
        const cycles = getRightCycles(currentCycle, limit)

        return forkJoin(
          cycles.map(cycle =>
            from(this.rewardService.calculateRewards(address, cycle)).pipe(
              map((reward: TezosRewards) => ({
                cycle,
                endorsementRewards: reward.endorsingRewards,
                deposits: reward.endorsingDeposits,
                endorsementsCount: reward.endorsingRewardsDetails.length,
                endorsingRewardsDetails: reward.endorsingRewardsDetails,
                rightStatus: getRightStatus(currentCycle, cycle)
              }))
            )
          )
        ).pipe(
          map((aggregatedRights: AggregatedEndorsingRights[]) => aggregatedRights.sort((a, b) => b.cycle - a.cycle)),
          map(ensureCycle(first(cycles), getEmptyAggregatedEndorsingRight))
        )
      })
    )
  }

  getEndorsingRightItems(address: string, cycle: number, endorsingRewardsDetails: EndorsingRewardsDetail[]): Observable<EndorsingRights[]> {
    const rewardByLevel = endorsingRewardsDetails.reduce(
      (accumulator, currentValue) => ((accumulator[currentValue.level] = currentValue), accumulator),
      {}
    )
    const setRewardsAndDeposits = (right: EndorsingRights): EndorsingRights => ({
      ...right,
      rewards: rewardByLevel[right.level] ? rewardByLevel[right.level].amount : '0',
      deposit: rewardByLevel[right.level] ? rewardByLevel[right.level].deposit : '0'
    })

    return this.store$
      .select(state => state.app.protocolVariables)
      .pipe(
        filter(negate(isNil)),
        map((protocolVariables: ProtocolConstantResponse) => protocolVariables.blocks_per_cycle),
        switchMap(blocks_per_cycle => {
          const minLevel = cycleToLevel(cycle, blocks_per_cycle)
          const maxLevel = cycleToLevel(cycle + 1, blocks_per_cycle)
          const predicates = [
            {
              field: 'block_level',
              operation: Operation.gt,
              set: [minLevel]
            },
            {
              field: 'block_level',
              operation: Operation.lt,
              set: [maxLevel]
            }
          ]

          return this.getEndorsingRights(address, blocks_per_cycle, 30000, predicates).pipe(
            map((rights: EndorsingRights[]) => rights.map(addCycleFromLevel(blocks_per_cycle))),
            map((rights: EndorsingRights[]) => rights.map(setRewardsAndDeposits))
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

  getFrozenBalance(address: string): Observable<number> {
    return this.cacheService.get<ByAddressState>(CacheKeys.byAddress).pipe(
      switchMap(byAddressCache => {
        const currentCycle = fromApp.currentCycleSelector(fromRoot.getState(this.store$).app)
        const frozenBalance = (<any>_get(byAddressCache, `${address}.frozenBalance`)) as ByCycle<number>

        if (frozenBalance && frozenBalance.cycle === currentCycle) {
          return of(frozenBalance.value)
        }

        return this.http
          .post<any[]>(
            this.delegatesApiUrl,
            {
              fields: ['frozen_balance'],
              predicates: [
                {
                  field: 'pkh',
                  operation: 'eq',
                  set: [address],
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
            ),
            tap(frozenBalance => {
              this.cacheService.update<ByAddressState>(CacheKeys.byAddress, byAddressCache => ({
                ...byAddressCache,
                [address]: {
                  ..._get(byAddressCache, address),
                  frozenBalance: { value: frozenBalance, cycle: currentCycle }
                }
              }))
            })
          )
      })
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

  getProposal(hash: string): Observable<ProposalDto> {
    return this.cacheService.get<ByProposalState>(CacheKeys.byProposal).pipe(
      switchMap(byProposalState => {
        const period: any = _get(byProposalState, hash)

        if (period) {
          return of({ proposal: hash, period })
        }

        return this.http
          .post<ProposalDto[]>(
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
                { field: 'proposal', operation: 'like', set: [hash], inverse: false }
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
          .pipe(
            map(first),
            map(item => ({ ...item, proposal: item.proposal.replace(squareBrackets, '') })),
            tap(proposal =>
              this.cacheService.update<ByProposalState>(CacheKeys.byProposal, byProposalState => ({
                ...byProposalState,
                [hash]: proposal.period
              }))
            )
          )
      })
    )
  }

  getProposals(limit: number, orderBy = { field: 'period', direction: 'desc' }): Observable<ProposalDto[]> {
    return this.http
      .post<ProposalDto[]>(
        this.transactionsApiUrl,
        {
          fields: ['proposal', 'period'],
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
    const protocol = getFaProtocol(contract, this.chainNetworkService.getEnvironment(), this.chainNetworkService.getNetwork())

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
            balance: balance.balance / xtzToMutezConvertionRatio
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
            balance: balance.balance / xtzToMutezConvertionRatio
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

  getErrorsForOperations(operations: Transaction[]): Observable<OperationErrorsById[]> {
    const distinctBlockLevels = operations.filter(operation => operation.status !== 'applied').map(operation => operation.block_level).filter(distinctFilter)
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
      )
    )
  }
}
