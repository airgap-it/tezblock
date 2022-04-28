import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { AliasService } from '@tezblock/services/alias/alias.service';
import { Options } from './options';
import { ContractAddress } from '@tezblock/domain/contract';

@Component({
  selector: 'address-item',
  templateUrl: './address-item.component.html',
  styleUrls: ['./address-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressItemComponent implements OnInit {
  @Input()
  set address(value: string) {
    if (value !== this._address) {
      this._address = value;
      this.formattedAddress = this.getFormattedAddress();
    }
  }
  get address(): string {
    return this._address || '';
  }
  private _address: string;

  @Input()
  set options(value: Options) {
    if (value !== this._options) {
      this._options = value;
      if (this.address) {
        this.formattedAddress =
          this.options.useValue ?? this.getFormattedAddress();
        if (this._options.showTezosDomain) {
          this.tezosDomainName = this.getTezosDomainsName();
        }

        this.isContract = this._options.isContract;
      }
    }
  }

  get options(): Options {
    return this._options;
  }

  private _options: Options;

  @Input()
  set clickableButton(value: boolean) {
    if (value !== this._clickableButton) {
      this._clickableButton = value;
    }
  }
  get clickableButton(): boolean {
    return this._clickableButton === undefined
      ? this.clickable
      : this._clickableButton;
  }
  private _clickableButton: boolean | undefined;

  get path(): string {
    return `/${this.isContract ? 'contract' : 'account'}/${this.address}`;
  }

  formattedAddress: string;
  tezosDomainName: Promise<string>;

  private isContract: boolean;

  private get clickable(): boolean {
    if (this._address === ContractAddress.TEZ) {
      return false;
    }
    return this.options && this.options.pageId
      ? this.options.pageId !== this.address
      : true;
  }

  constructor(
    private readonly chainNetworkService: ChainNetworkService,
    private readonly aliasService: AliasService
  ) {}

  ngOnInit() {}

  private getFormattedAddress() {
    return this.aliasService.getFormattedAddress(this.address, this.options);
  }

  private async getTezosDomainsName(): Promise<string> {
    return this.aliasService.tezosDomainsAddressToName(this.address);
  }
}
