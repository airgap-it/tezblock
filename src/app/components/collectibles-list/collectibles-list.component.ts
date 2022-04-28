import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CollectiblesModalItemComponent } from '../collectibles-modal-item/collectibles-modal-item.component';
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

  @Output()
  onLoadMore: EventEmitter<void> = new EventEmitter();

  constructor(private readonly modalService: BsModalService) {}

  showCollectiblesModal(item: Collectible) {
    const modalRef = this.modalService.show(CollectiblesModalItemComponent, {
      class: 'modal-xl',
    });
    modalRef.content.item = item;

    modalRef.content.closeBtnName = 'Close';
  }

  public loadMore() {
    this.onLoadMore.next();
  }
}
