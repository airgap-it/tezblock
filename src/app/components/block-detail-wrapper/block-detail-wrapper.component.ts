import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AmountData } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { NewBlockService } from '@tezblock/services/blocks/blocks.service'
import { Block } from 'src/app/interfaces/Block'

@Component({
  selector: 'block-detail-wrapper',
  templateUrl: './block-detail-wrapper.component.html',
  styleUrls: ['./block-detail-wrapper.component.scss']
})
export class BlockDetailWrapperComponent implements OnInit {
  isCollapsed = true

  @Input()
  wrapperBlock$: Observable<Block> | undefined

  @Input()
  endorsements$: Observable<number> | undefined

  @Input()
  confirmations$: Observable<number> | undefined

  @Input()
  blockLoading$: Observable<boolean> | undefined

  @Output()
  blockChangeClicked: EventEmitter<string> = new EventEmitter()

  amountFromBlockVolume$: Observable<AmountData>
  amountFromBlockFee$: Observable<AmountData>

  latestBlock$ = this.blockService.getLatest()

  constructor(private readonly blockService: NewBlockService) {}

  public ngOnInit() {
    this.amountFromBlockVolume$ = this.wrapperBlock$.pipe(map(block => ({ amount: block.volume, timestamp: block.timestamp })))

    this.amountFromBlockFee$ = this.wrapperBlock$.pipe(map(block => ({ amount: block.fee, timestamp: block.timestamp })))
  }

  changeBlockLevel(direction: string) {
    this.blockChangeClicked.emit(direction)
  }
}
