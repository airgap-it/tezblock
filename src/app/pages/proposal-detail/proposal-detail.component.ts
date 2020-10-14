import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { ActivatedRoute } from '@angular/router'
import { Observable, combineLatest } from 'rxjs'
import { filter, map, withLatestFrom } from 'rxjs/operators'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Actions, ofType } from '@ngrx/effects'
import { isNil, negate } from 'lodash'
import { $enum } from 'ts-enum-util'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { CopyService } from 'src/app/services/copy/copy.service'
import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { BaseComponent } from '@tezblock/components/base.component'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Tab, updateTabCounts } from '@tezblock/domain/tab'
import { columns } from './table-definitions'
import { PeriodKind, PeriodTimespan, MetaVotingPeriod } from '@tezblock/domain/vote'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import * as moment from 'moment'
import { get } from '@tezblock/services/fp'
import { getRefresh } from '@tezblock/domain/synchronization'
import { TranslateService } from '@ngx-translate/core'
import { Title, Meta } from '@angular/platform-browser'
import { AliasService } from '@tezblock/services/alias/alias.service'

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent extends BaseComponent implements OnInit {
  proposal$: Observable<ProposalDto>
  votes$: Observable<Transaction[]>
  loading$: Observable<boolean>
  periodTimespan$: Observable<PeriodTimespan>
  tabs: Tab[]
  now: number = moment.utc().valueOf()
  noDataLabel$: Observable<string>
  periodKind$: Observable<string>
  isCollapsed = true
  yayRolls$: Observable<number>
  nayRolls$: Observable<number>
  passRolls$: Observable<number>
  yayRollsPercentage$: Observable<number>
  nayRollsPercentage$: Observable<number>
  showRolls$: Observable<boolean>

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  get proposalHash(): string {
    return this.activatedRoute.snapshot.params.id
  }

  constructor(
    private readonly actions$: Actions,
    private readonly activatedRoute: ActivatedRoute,
    private readonly aliasPipe: AliasPipe,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly copyService: CopyService,
    private readonly store$: Store<fromRoot.State>,
    private readonly iconPipe: IconPipe,
    private translateService: TranslateService,
    private titleService: Title,
    private metaTagService: Meta,
    private aliasService: AliasService
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.titleService.setTitle(`Proposal ${this.aliasService.getFormattedAddress(this.proposalHash)} - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Proposal Hash ${this.proposalHash}. The name, period, discussion, features, documentation, exploration, testing and promotion of the proposal are detailed on tezblock.">`
    })
    this.proposal$ = this.store$.select(state => state.proposalDetails.proposal)
    this.votes$ = this.store$.select(state => state.proposalDetails.votes.data)
    this.loading$ = this.store$.select(state => state.proposalDetails.votes.loading)
    this.periodTimespan$ = combineLatest([
      this.store$.select(state => state.proposalDetails.periodKind),
      this.store$.select(state => state.proposalDetails.periodsTimespans)
    ]).pipe(
      filter(([periodKind, periodsTimespans]) => !!periodKind && !!periodsTimespans),
      map(
        ([periodKind, periodsTimespans]) =>
          periodsTimespans[
            [PeriodKind.Proposal, PeriodKind.Exploration, PeriodKind.Testing, PeriodKind.Promotion].indexOf(<PeriodKind>periodKind)
          ]
      )
    )
    this.noDataLabel$ = this.store$
      .select(state => state.proposalDetails.periodKind)
      .pipe(
        withLatestFrom(this.store$.select(state => state.proposalDetails.proposal)),
        filter(([periodKind, proposal]) => !!proposal),
        map(([periodKind, proposal]) =>
          periodKind === PeriodKind.Testing
            ? `${this.aliasPipe.transform(proposal.proposal, 'proposal')} upgrade is investigated by the community.`
            : undefined
        )
      )
    this.periodKind$ = this.store$
      .select(state => state.proposalDetails.periodKind)
      .pipe(
        filter(negate(isNil)),
        map(periodKind => $enum(PeriodKind).getKeyOrThrow(periodKind))
      )
    this.yayRolls$ = this.store$.select(fromRoot.proposalDetails.yayRolls)
    this.nayRolls$ = this.store$.select(fromRoot.proposalDetails.nayRolls)
    this.passRolls$ = this.store$.select(fromRoot.proposalDetails.passRolls)
    this.yayRollsPercentage$ = this.store$.select(fromRoot.proposalDetails.yayRollsPercentage)
    this.nayRollsPercentage$ = this.store$.select(fromRoot.proposalDetails.nayRollsPercentage)
    this.showRolls$ = combineLatest([this.store$.select(state => state.proposalDetails.periodKind), this.yayRolls$]).pipe(
      map(
        ([periodKind, yayRolls]) =>
          [<string>PeriodKind.Exploration, <string>PeriodKind.Promotion].indexOf(periodKind) !== -1 && yayRolls !== undefined
      )
    )

    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(paramMap => {
        const id = paramMap.get('id')
        const tabTitle: string = this.activatedRoute.snapshot.queryParamMap.get('tab') || undefined
        this.setTabs(tabTitle)

        this.store$.dispatch(actions.loadProposal({ id }))
      }),

      this.actions$.pipe(ofType(actions.loadVotesTotalSucceeded)).subscribe(
        ({ metaVotingPeriods }) =>
          (this.tabs = updateTabCounts(
            this.tabs,
            metaVotingPeriods.map(metaVotingPeriod => ({
              key: metaVotingPeriod.periodKind,
              count: metaVotingPeriod.count
            }))
          ))
      ),

      combineLatest(
        this.activatedRoute.paramMap.pipe(filter(paramMap => !!paramMap.get('id'))),
        this.store$.select(state => state.proposalDetails.proposal)
      )
        .pipe(filter(([paramMap, proposal]) => !!proposal))
        .subscribe(() => {
          const tabTitle: string = this.activatedRoute.snapshot.queryParamMap.get('tab') || undefined
          const periodKind: PeriodKind = tabTitle ? <PeriodKind>this.tabs.find(tab => tab.title === tabTitle).kind : PeriodKind.Proposal

          this.store$.dispatch(actions.startLoadingVotes({ periodKind }))
        }),

      getRefresh([this.actions$.pipe(ofType(actions.loadVotesSucceeded)), this.actions$.pipe(ofType(actions.loadVotesFailed))])
        .pipe(
          withLatestFrom(
            this.store$.select(state => state.proposalDetails.periodKind),
            this.store$.select(state => state.proposalDetails.metaVotingPeriods),
            this.store$.select(state => state.app.currentVotingPeriod)
          ),
          filter(([refreshNo, periodKind, metaVotingPeriods, currentVotingPeriod]) => {
            if (!metaVotingPeriods || !currentVotingPeriod) {
              return false
            }

            const currentPeriod = metaVotingPeriods.find(period => period.value === currentVotingPeriod)

            return currentPeriod && currentPeriod.periodKind === periodKind
          })
        )
        .subscribe(([refreshNo, periodKind]) => this.store$.dispatch(actions.loadVotes({ periodKind })))
    )
  }

  copyToClipboard() {
    this.copyService.copyToClipboard(fromRoot.getState(this.store$).proposalDetails.proposal.proposal)
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  tabSelected(periodKind: string) {
    this.store$.dispatch(actions.startLoadingVotes({ periodKind }))
  }

  private setTabs(selectedTitle: string = 'Proposal') {
    this.tabs = [
      {
        title: this.translateService.instant('tabbed-table.proposal-detail.proposal'),
        active: selectedTitle === 'Proposal',
        kind: PeriodKind.Proposal,
        count: undefined,
        icon: this.iconPipe.transform('fileUpload'),
        columns: columns(this.translateService).filter(column => column.field !== 'ballot'),
        disabled: () => false
      },
      {
        title: this.translateService.instant('tabbed-table.proposal-detail.exploration'),
        active: selectedTitle === 'Exploration',
        kind: PeriodKind.Exploration,
        count: undefined,
        icon: this.iconPipe.transform('binoculars'),
        columns: columns(this.translateService),
        disabled: () => {
          const metaVotingPeriods = fromRoot.getState(this.store$).proposalDetails.metaVotingPeriods

          if (!metaVotingPeriods) {
            return true
          }

          const period = metaVotingPeriods.find(metaVotingPeriod => metaVotingPeriod.periodKind === PeriodKind.Exploration)

          const result = !period || get<MetaVotingPeriod>(period => !period.value)(period)
          return result
        }
      },
      {
        title: this.translateService.instant('tabbed-table.proposal-detail.exploration'),
        active: selectedTitle === 'Testing',
        kind: PeriodKind.Testing,
        count: undefined,
        icon: this.iconPipe.transform('hammer'),
        columns: columns(this.translateService),
        emptySign: '-',
        disabled: () => {
          const metaVotingPeriods = fromRoot.getState(this.store$).proposalDetails.metaVotingPeriods

          if (!metaVotingPeriods) {
            return true
          }

          const period = metaVotingPeriods.find(metaVotingPeriod => metaVotingPeriod.periodKind === PeriodKind.Testing)

          return !period || get<MetaVotingPeriod>(period => !period.value)(period)
        }
      },
      {
        title: this.translateService.instant('tabbed-table.proposal-detail.promotion'),
        active: selectedTitle === 'Promotion',
        kind: PeriodKind.Promotion,
        count: undefined,
        icon: this.iconPipe.transform('graduationCap'),
        columns: columns(this.translateService),
        disabled: () => {
          const metaVotingPeriods = fromRoot.getState(this.store$).proposalDetails.metaVotingPeriods

          if (!metaVotingPeriods) {
            return true
          }

          const period = metaVotingPeriods.find(metaVotingPeriod => metaVotingPeriod.periodKind === PeriodKind.Promotion)

          return !period || get<MetaVotingPeriod>(period => !period.value)(period)
        }
      }
    ]
  }
}
