import { Component, OnInit } from '@angular/core'
import { Observable } from "rxjs";

import { WalletService } from "../../services/wallet/wallet.service";
import { Wallet } from "../../interfaces/Wallet";

@Component({
  selector: 'app-resources-wallets',
  templateUrl: './resources-wallets.component.html',
  styleUrls: ['./resources-wallets.component.scss']
})
export class ResourcesWalletsComponent implements OnInit {
  constructor(private walletService: WalletService) {}

  get wallets$(): Observable<Wallet[]> {
    return this.walletService.get();
  }

  ngOnInit() {}
}
