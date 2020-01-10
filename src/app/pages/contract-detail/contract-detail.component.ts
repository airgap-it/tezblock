import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Store } from '@ngrx/store'
import { from, Observable } from 'rxjs'
import { animate, state, style, transition, trigger } from '@angular/animations'

import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { Contract, Social, SocialType, ContractOperation } from '@tezblock/domain/contract'
import { AccountService } from '../../services/account/account.service'
import { map, filter } from 'rxjs/operators'
import { isNil, negate } from 'lodash'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss'],
  animations: [
    trigger('changeBtnColor', [
      state(
        'copyTick',
        style({
          backgroundColor: 'lightgreen',
          backgroundImage: ''
        })
      ),
      transition('copyGrey =>copyTick', [animate(250, style({ transform: 'rotateY(360deg) scale(1.3)', backgroundColor: 'lightgreen' }))])
    ])
  ]
})
export class ContractDetailComponent extends BaseComponent implements OnInit {
  address$: Observable<string>
  contract$: Observable<Contract>
  website$: Observable<string>
  twitter$: Observable<string>
  telegram$: Observable<string>
  medium$: Observable<string>
  github$: Observable<string>
  copyToClipboardState$: Observable<string>
  revealed$: Observable<string>
  hasAlias$: Observable<boolean>
  loading$: Observable<boolean>
  transferOperations$: Observable<ContractOperation[]>

  current: string = 'copyGrey'

  constructor(
    private readonly accountService: AccountService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly aliasPipe: AliasPipe,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()

    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(paramMap => {
        const address = paramMap.get('id')

        this.store$.dispatch(actions.reset())
        this.store$.dispatch(actions.loadContract({ address }))

        this.revealed$ = from(this.accountService.getAccountStatus(address))
      })
    )
  }

  ngOnInit() {
    this.address$ = this.store$.select(state => state.contractDetails.address)
    this.contract$ = this.store$.select(state => state.contractDetails.contract)
    this.website$ = this.getSocial(social => social.type === SocialType.website)
    this.twitter$ = this.getSocial(social => social.type === SocialType.twitter)
    this.telegram$ = this.getSocial(social => social.type === SocialType.telegram)
    this.medium$ = this.getSocial(social => social.type === SocialType.medium)
    this.github$ = this.getSocial(social => social.type === SocialType.github)
    this.copyToClipboardState$ = this.store$.select(state => state.contractDetails.copyToClipboardState)
    this.hasAlias$ = this.store$.select(state => state.contractDetails.address).pipe(
      map(address => address && !!this.aliasPipe.transform(address))
    )
    this.transferOperations$ = this.store$.select(state => state.contractDetails.transferOperations.data)
    this.loading$ = this.store$.select(state => state.contractDetails.transferOperations.loading)
  }

  showQr() {
    this.store$.dispatch(actions.showQr())
  }

  showTelegramModal() {
    this.store$.dispatch(actions.showTelegramModal())
  }

  copyToClipboard(address: string) {
    this.store$.dispatch(actions.copyAddressToClipboard({ address }))
  }

  loadMore() {
    this.store$.dispatch(actions.loadMoreTransferOperations())
  }

  private getSocial(condition: (social: Social) => boolean): Observable<string> {
    return this.store$
      .select(state => state.contractDetails.contract)
      .pipe(
        filter(negate(isNil)),
        map(contract => {
          const match = contract.socials.find(condition)

          return match ? match.url : null
        })
      )
  }
}
