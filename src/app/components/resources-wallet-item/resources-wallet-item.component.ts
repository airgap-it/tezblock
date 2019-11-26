import { Component, Input, OnInit } from '@angular/core';

import { Wallet } from "../../interfaces/Wallet";

@Component({
  selector: 'app-resources-wallet-item',
  templateUrl: './resources-wallet-item.component.html',
  styleUrls: ['./resources-wallet-item.component.scss']
})
export class ResourcesWalletItemComponent implements OnInit {

  @Input() wallet: Wallet;

  constructor() { }

  ngOnInit() {
  }

  getLogo(wallet: Wallet): string {
    return `assets/img/wallets/${wallet.logo}`;
  }

}
