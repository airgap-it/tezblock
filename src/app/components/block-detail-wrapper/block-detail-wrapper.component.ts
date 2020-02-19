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
  public isCollapsed = true

  @Input()
  public wrapperBlock$: Observable<Block> | undefined

  @Input()
  public endorsements$: Observable<number> | undefined

  @Input()
  public confirmations$: Observable<number> | undefined

  @Input()
  public blockLoading$: Observable<boolean> | undefined

  @Output()
  blockChangeClicked: EventEmitter<string> = new EventEmitter()

  public amountFromBlockVolume$: Observable<AmountData>
  public amountFromBlockFee$: Observable<AmountData>

  public latestBlock$ = this.blockService.getLatest()

  constructor(private readonly blockService: NewBlockService) {}

  public ngOnInit() {
    this.amountFromBlockVolume$ = this.wrapperBlock$.pipe(map(block => ({ amount: block.volume, timestamp: block.timestamp })))

    this.amountFromBlockFee$ = this.wrapperBlock$.pipe(map(block => ({ amount: block.fee, timestamp: block.timestamp })))
  }

  changeBlockLevel(direction: string) {
    this.blockChangeClicked.emit(direction)
  }
}
