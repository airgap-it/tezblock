import { Component } from '@angular/core';
import { CollectibleDetails } from '@tezblock/services/collectibles/collectibles.types';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-collectibles-modal-item',
  templateUrl: './collectibles-modal-item.component.html',
  styleUrls: ['./collectibles-modal-item.component.scss'],
})
export class CollectiblesModalItemComponent {
  public item: CollectibleDetails;
  constructor(public bsModalRef: BsModalRef) {}
}
