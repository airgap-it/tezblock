import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { of, pipe, Observable, forkJoin } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { BaseService, Operation, Predicate } from '@tezblock/services/base.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { first, get } from '@tezblock/services/fp'
import { PeriodKind, MetaVotingPeriod, PeriodTimespan, getPeriodTimespanQuery, DivisionOfVotes } from '@tezblock/domain/vote'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { ApiService } from '@tezblock/services/api/api.service'
import { Pagination } from '@tezblock/domain/table'
import { meanBlockTimeFromPeriod } from '@tezblock/app.reducer'

@Injectable({
  providedIn: 'root'
})
export class ProposalService extends BaseService {
  constructor(private readonly apiService: ApiService, readonly chainNetworkService: ChainNetworkService, readonly httpClient: HttpClient) {
    super(chainNetworkService, httpClient)
  }

  getMetaVotingPeriods(proposalHash: string, proposal: ProposalDto): Observable<MetaVotingPeriod[]> {
    return forkJoin(
      // this.getMetaVotingPeriod(proposalHash, PeriodKind.Proposal),
      this.getMetaVotingPeriod(proposalHash, PeriodKind.Exploration),
      this.getMetaVotingPeriod(proposalHash, PeriodKind.Testing),
      this.getMetaVotingPeriod(proposalHash, PeriodKind.Promotion)
    ).pipe(
      map(metaVotingPeriodCounts => [
        {
          periodKind: PeriodKind.Proposal,
          value: metaVotingPeriodCounts[0] ? metaVotingPeriodCounts[0] - 1 : proposal.period
        },
        { periodKind: PeriodKind.Exploration, value: metaVotingPeriodCounts[0] },
        { periodKind: PeriodKind.Testing, value: metaVotingPeriodCounts[1] },
        { periodKind: PeriodKind.Promotion, value: metaVotingPeriodCounts[2] }
      ])
    )
  }

  getVotes(
    periodKind: string,
    metaVotingPeriods: MetaVotingPeriod[],
    proposalHash: string,
    pagination: Pagination
  ): Observable<Transaction[]> {
    const metaVotingPeriod = get<MetaVotingPeriod>(period => period.value)(
      metaVotingPeriods.find(period => period.periodKind === periodKind)
    )

    return this.post<Transaction[]>('operations', {
      predicates: [
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['ballot']
        },
        {
          field: 'proposal',
          operation: Operation.eq,
          set: [proposalHash]
        },
        {
          field: 'period',
          operation: Operation.eq,
          set: [metaVotingPeriod]
        }
      ],
      orderBy: [
        {
          field: 'block_level',
          direction: 'desc'
        }
      ],
      limit: pagination.currentPage * pagination.selectedSize
    }).pipe(switchMap((votes: Transaction[]) => this.apiService.addVoteData(votes)))
  }

  getProposalVotes(proposalHash, pagination): Observable<Transaction[]> {
    return this.post<Transaction[]>('operations', {
      fields: [],
      predicates: [
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['proposals'],
          inverse: false
        },
        {
          field: 'proposal',
          operation: Operation.like,
          set: [proposalHash],
          inverse: false
        }
      ],
      orderBy: [
        {
          field: 'block_level',
          direction: 'desc'
        }
      ],
      limit: pagination.currentPage * pagination.selectedSize
    })
  }

  getVotesTotal(proposalHash: string, metaVotingPeriods: MetaVotingPeriod[]): Observable<MetaVotingPeriod[]> {
    const _metaVotingPeriods = metaVotingPeriods.filter(
      metaVotingPeriod => !!metaVotingPeriod.value && metaVotingPeriod.periodKind !== PeriodKind.Proposal
    )

    return forkJoin(
      [this.getProposalVotesCount(proposalHash)].concat(
        _metaVotingPeriods.map(metaVotingPeriod => this.getMetaVotingPeriodCount(proposalHash, metaVotingPeriod.value))
      )
    ).pipe(
      map(counts =>
        [
          {
            ...metaVotingPeriods[0],
            count: counts[0]
          }
        ].concat(_metaVotingPeriods.map((metaVotingPeriod, index) => ({ ...metaVotingPeriod, count: counts[index + 1] })))
      )
    )
  }

  getPeriodsTimespans(
    metaVotingPeriods,
    currentVotingPeriod,
    blocksPerVotingPeriod
  ): Observable<{ periodsTimespans: PeriodTimespan[]; blocksPerVotingPeriod: number }> {
    return forkJoin(
      forkJoin(
        metaVotingPeriods.map(period =>
          period.value <= currentVotingPeriod
            ? this.post<{ timestamp: number }[]>('blocks', getPeriodTimespanQuery(period.value, 'asc')).pipe(
                map(first),
                map(get(item => item.timestamp))
              )
            : of(null)
        )
      ),
      forkJoin(
        metaVotingPeriods.map(period =>
          period.value < currentVotingPeriod
            ? this.post<{ timestamp: number }[]>('blocks', getPeriodTimespanQuery(period.value, 'desc')).pipe(
                map(first),
                map(get(item => (item.timestamp ? item.timestamp + meanBlockTimeFromPeriod /* seconds */ * 1000 : item.timestamp)))
              )
            : of(null)
        )
      )
    ).pipe(
      map(response => ({
        periodsTimespans: response[0].map((start, index) => <PeriodTimespan>{ start, end: response[1][index] }),
        blocksPerVotingPeriod
      }))
    )
  }

  getProposalDescription(id: string) {
    return this.httpClient.get(`../../../assets/proposals/descriptions/${id}.html`, { responseType: 'text' })
  }

  getDivisionOfVotes(arg: { proposalHash?: string; votingPeriod?: number }): Observable<DivisionOfVotes[]> {
    const predicates: Predicate[] = []
      .concat(
        arg.proposalHash
          ? [
              {
                field: 'proposal_hash',
                operation: Operation.eq,
                set: [arg.proposalHash],
                inverse: false
              }
            ]
          : []
      )
      .concat(
        arg.votingPeriod
          ? [
              {
                field: 'voting_period',
                operation: Operation.eq,
                set: [arg.votingPeriod],
                inverse: false
              }
            ]
          : []
      )

    return this.post<DivisionOfVotes[]>('governance', {
      fields: [
        'voting_period',
        'proposal_hash',
        'voting_period_kind',
        'level',
        'yay_count',
        'yay_rolls',
        'pass_count',
        'pass_rolls',
        'nay_count',
        'nay_rolls'
      ],
      predicates,
      orderBy: [{ field: 'max_level', direction: 'desc' }],
      aggregation: [
        { field: 'level', function: 'max' },
        { field: 'yay_count', function: 'max' },
        { field: 'yay_rolls', function: 'max' },
        { field: 'pass_count', function: 'max' },
        { field: 'pass_rolls', function: 'max' },
        { field: 'nay_count', function: 'max' },
        { field: 'nay_rolls', function: 'max' }
      ],
      limit: 1000
    })
  }

  private getMetaVotingPeriod(proposalHash: string, periodKind: string): Observable<number> {
    return this.post<Block[]>('blocks', {
      fields: ['meta_voting_period'],
      predicates: [
        {
          field: 'active_proposal',
          operation: Operation.eq,
          set: [proposalHash],
          inverse: false
        },
        {
          field: 'period_kind',
          operation: Operation.eq,
          set: [periodKind],
          inverse: false
        }
      ],
      orderBy: [
        {
          field: 'level',
          direction: 'desc'
        }
      ],
      limit: 1
    }).pipe(
      map(
        pipe(
          first,
          get<Block>(block => block.meta_voting_period)
        )
      )
    )
  }

  private getMetaVotingPeriodCount(proposalHash: string, metaVotingPeriod: number): Observable<number> {
    return this.post<Transaction[]>('operations', {
      fields: ['proposal'],
      predicates: [
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['ballot']
        },
        {
          field: 'proposal',
          operation: Operation.eq,
          set: [proposalHash]
        },
        {
          field: 'period',
          operation: Operation.eq,
          set: [metaVotingPeriod]
        }
      ],
      aggregation: [
        {
          field: 'proposal',
          function: 'count'
        }
      ]
    }).pipe(
      map(
        pipe(
          first,
          get<any>(item => parseInt(item.count_proposal))
        )
      )
    )
  }

  private getProposalVotesCount(proposalHash: string): Observable<number> {
    return this.post<Transaction[]>('operations', {
      fields: ['proposal'],
      predicates: [
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['proposals'],
          inverse: false
        },
        {
          field: 'proposal',
          operation: Operation.like,
          set: [proposalHash],
          inverse: false
        }
      ],
      aggregation: [
        {
          field: 'proposal',
          function: 'count'
        }
      ]
    }).pipe(
      map(
        pipe(
          first,
          get<any>(item => parseInt(item.count_proposal))
        )
      )
    )
  }
}
