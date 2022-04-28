import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';

import { TokenContract } from '@tezblock/domain/contract';
import { isConvertableToUSD } from '@tezblock/domain/airgap';

@Component({
  selector: 'app-latest-contracts',
  templateUrl: './latest-contracts.component.html',
  styleUrls: ['./latest-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatestContractsComponent implements OnInit {
  @Input()
  contracts: TokenContract[];

  constructor() {}

  ngOnInit() {}

  showFiatValue(contract: TokenContract): boolean {
    return isConvertableToUSD(contract.symbol);
  }
}
