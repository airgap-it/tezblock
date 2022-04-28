import { Component, Input } from '@angular/core';
import { getCuratedContractName } from '@tezblock/domain/account';
import { ContractAsset } from '@tezblock/domain/contract';
import BigNumber from 'bignumber.js';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';

@Component({
  selector: 'transfer-button',
  templateUrl: './transfer-button.component.html',
  styleUrls: ['./transfer-button.component.scss'],
})
export class TransferButtonComponent {
  @Input()
  asset: ContractAsset;

  constructor(private readonly modalService: BsModalService) {}

  transfer() {
    this.modalService.show(TransferModalComponent, {
      class: 'modal-md',
      initialState: {
        balance$: of(new BigNumber(this.asset.amount)),
        decimals: this.asset.decimals,
        contractType: this.asset.contract.type,
        symbol:
          this.asset.contract.symbol ??
          getCuratedContractName(this.asset.contract.contractAddress),
        contractAddress: this.asset.contract.contractAddress,
        tokenId: this.asset.contract.tokenId,
        thumbnailUri: this.asset.thumbnailUri,
      },
    });
  }
}
