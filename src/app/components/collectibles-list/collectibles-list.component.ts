import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CollectiblesModalItemComponent } from '../collectibles-modal-item/collectibles-modal-item.component';
import * as fromRoot from '@tezblock/reducers';
import * as actions from '../../pages/account-detail/actions';
import {
  Collectible,
  CollectibleCursor,
} from '@tezblock/services/collectibles/collectibles.types';

@Component({
  selector: 'app-collectibles-list',
  templateUrl: './collectibles-list.component.html',
  styleUrls: ['./collectibles-list.component.scss'],
})
export class CollectiblesListComponent {
  @Input()
  data: CollectibleCursor;

  constructor(
    private readonly modalService: BsModalService,
    private readonly store$: Store<fromRoot.State>
  ) {}

  showCollectiblesModal(item: Collectible) {
    const modalRef = this.modalService.show(CollectiblesModalItemComponent, {
      class: 'modal-xl',
    });
    modalRef.content.item = item;

    modalRef.content.closeBtnName = 'Close';
  }

  public loadMore() {
    this.store$.dispatch(actions.loadCollectibles());
  }
}
