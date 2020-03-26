import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AmountData } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { Block } from 'src/app/interfaces/Block'

@Component({
  selector: 'block-detail-wrapper',
  templateUrl: './block-detail-wrapper.component.html',
  styleUrls: ['./block-detail-wrapper.component.scss']
})
export class BlockDetailWrapperComponent implements OnInit {
  isCollapsed = true

  @Input()
  wrapperBlock: Block

  @Input()
  endorsements: number

  @Input()
  confirmations: number

  @Input()
  blockLoading: boolean

  @Input()
  latestBlock: Block

  @Output()
  blockChangeClicked: EventEmitter<string> = new EventEmitter()

  get amountFromBlockVolume(): AmountData {
    return this.wrapperBlock ? { amount: this.wrapperBlock.volume, timestamp: this.wrapperBlock.timestamp } : undefined
  }

  get amountFromBlockFee(): AmountData {
    return this.wrapperBlock ? { amount: this.wrapperBlock.fee, timestamp: this.wrapperBlock.timestamp } : undefined
  }

  constructor() {}

  ngOnInit() {}

  changeBlockLevel(direction: string) {
    this.blockChangeClicked.emit(direction)
  }
}
