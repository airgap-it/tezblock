import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

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
  blockChangeClicked: EventEmitter<number> = new EventEmitter()

  get amountFromBlockVolume(): { data: any, options: any } {
    return this.wrapperBlock ? { data: this.wrapperBlock.volume, options: { comparisonTimestamp: this.wrapperBlock.timestamp } } : undefined
  }

  get amountFromBlockFee(): { data: any, options: any } {
    return this.wrapperBlock ? { data: this.wrapperBlock.fee, options: { comparisonTimestamp: this.wrapperBlock.timestamp } } : undefined
  }

  constructor() {}

  ngOnInit() {}

  changeBlockLevel(change: number) {
    this.blockChangeClicked.emit(change)
  }
}
