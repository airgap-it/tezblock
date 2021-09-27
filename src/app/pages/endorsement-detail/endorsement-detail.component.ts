import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '@tezblock/components/base.component';
import { refreshRate } from '@tezblock/domain/synchronization';
import { CopyService } from 'src/app/services/copy/copy.service';
import * as actions from './actions';
import { Transaction } from '@tezblock/interfaces/Transaction';
import * as fromRoot from '@tezblock/reducers';
import { Slot } from './reducer';
import { get } from '@tezblock/services/fp';
import { Title, Meta } from '@angular/platform-browser';
import { AliasService } from '@tezblock/services/alias/alias.service';
import { squareBrackets } from '@tezblock/domain/pattern';

@Component({
  selector: 'app-endorsement-detail',
  templateUrl: './endorsement-detail.component.html',
  styleUrls: ['./endorsement-detail.component.scss'],
})
export class EndorsementDetailComponent
  extends BaseComponent
  implements OnInit
{
  private get id(): string {
    return this.activatedRoute.snapshot.paramMap.get('id');
  }

  endorsements$: Observable<Transaction[]>;
  selectedEndorsement$: Observable<Transaction>;
  slots$: Observable<Slot[]>;
  endorsedSlots$: Observable<string>;
  endorsedSlotsCount$: Observable<number>;

  get endorsementHash(): string {
    return this.activatedRoute.snapshot.params.id;
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly store$: Store<fromRoot.State>,
    private readonly copyService: CopyService,
    private readonly router: Router,
    private titleService: Title,
    private metaTagService: Meta,
    private aliasService: AliasService
  ) {
    super();
  }

  ngOnInit() {
    this.endorsements$ = this.store$.select(
      (state) => state.endorsementDetails.endorsements
    );
    this.selectedEndorsement$ = this.store$.select(
      (state) => state.endorsementDetails.selectedEndorsement
    );
    this.slots$ = this.store$.select((state) => state.endorsementDetails.slots);
    this.endorsedSlots$ = this.selectedEndorsement$.pipe(
      map(get((selectedEndorsement) => selectedEndorsement.slots)),
      map((slots) => (slots ? slots.replace(squareBrackets, '') : slots))
    );
    this.endorsedSlotsCount$ = this.selectedEndorsement$.pipe(
      map(get((selectedEndorsement) => selectedEndorsement.slots)),
      map((slots) => (slots ? slots.replace(squareBrackets, '') : slots)),
      map((slots: string) => slots.split(',').length)
    );

    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe((paramMap) => {
        const id = paramMap.get('id');

        this.store$.dispatch(actions.reset({ id }));
        this.store$.dispatch(actions.loadEndorsementDetails({ id }));
      }),
      timer(refreshRate, refreshRate).subscribe(() =>
        this.store$.dispatch(actions.loadEndorsements())
      )
    );
    this.titleService.setTitle(
      `${this.aliasService.getFormattedAddress(
        this.endorsementHash
      )} Endorsement - tezblock`
    );
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Endorsement Hash ${this.endorsementHash}. The hash, endorser, block, cycle, deposit, reward and endorsed slots are detailed on tezblock.">`,
    });
  }

  copyToClipboard() {
    this.copyService.copyToClipboard(
      fromRoot.getState(this.store$).endorsementDetails.selectedEndorsement
        .operation_group_hash
    );
  }

  select(operation_group_hash: string) {
    if (operation_group_hash) {
      this.router.navigate(['/endorsement', operation_group_hash]);
    }
  }
}
