import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { TokenContract, getConventer } from '@tezblock/domain/contract'
import { Conventer } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { isConvertableToUSD } from '@tezblock/domain/airgap'

@Component({
  selector: 'app-latest-contracts',
  templateUrl: './latest-contracts.component.html',
  styleUrls: ['./latest-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestContractsComponent implements OnInit {

  @Input()
  contracts: TokenContract[]

  constructor(private readonly router: Router) {}

  ngOnInit() {
  }

  getConventer(contract: TokenContract): Conventer {
    return getConventer(contract)
  }

  inspectDetail(contractHash: string) {
    this.router.navigate([`/contract/${contractHash}`])
  }

  showFiatValue(contract: TokenContract): boolean {
    return isConvertableToUSD(contract.symbol)
  }
}
