import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core'

import { getTokenContractByAddress, TokenContract } from '@tezblock/domain/contract'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'

export interface Options {
  pageId?: string | number
  isText?: boolean
  showFiatValue?: boolean
  showFullAddress?: boolean
  showAlliasOrFullAddress?: boolean
  forceIdenticon?: boolean
  hideIdenticon?: boolean
  kind?: string //TODO: not needed probably
}

@Component({
  selector: 'address-item',
  templateUrl: './address-item.component.html',
  styleUrls: ['./address-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressItemComponent implements OnInit {
  @Input()
  set address(value: string) {
    if (value !== this._address) {
      this._address = value
      this.contract = getTokenContractByAddress(value)
    }
  }
  get address(): string {
    return this._address || ''
  }
  private _address: string

  @Input() options: Options

  @Input()
  set clickableButton(value: boolean) {
    if (value !== this._clickableButton) {
      this._clickableButton = value
    }
  }
  get clickableButton(): boolean {
    return this._clickableButton === undefined ? this.clickable : this._clickableButton
  }
  private _clickableButton: boolean | undefined

  get clickable(): boolean {
    return this.options && this.options.pageId ? this.options.pageId !== this.address : true
  }

  get path(): string {
    return `/${this.contract ? 'contract' : 'account'}`
  }

  formattedAddress: string

  private contract: TokenContract

  constructor(private readonly aliasPipe: AliasPipe, private readonly shortenStringPipe: ShortenStringPipe) {}

  ngOnInit() {
    this.formattedAddress = this.getFormattedAddress()
  }

  private getFormattedAddress() {
    const getAliasOrShorten = () => this.aliasPipe.transform(this.address) || this.shortenStringPipe.transform(this.address)

    if (!this.options) {
      return getAliasOrShorten()
    }

    if (this.options.showAlliasOrFullAddress) {
      return this.formattedAddress = this.aliasPipe.transform(this.address) || this.address
    }

    if (this.options.showFullAddress) {
      return this.address
    }

    return getAliasOrShorten()
  }
}
