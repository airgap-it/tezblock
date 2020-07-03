import { Injectable } from '@angular/core'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'
import { Options } from '@tezblock/components/address-item/options'

@Injectable({
  providedIn: 'root'
})
export class AliasService {
  constructor(private readonly aliasPipe: AliasPipe, private readonly shortenStringPipe: ShortenStringPipe) {}

  getFormattedAddress(address: string, options?: Options) {
    const getAliasOrShorten = () => this.aliasPipe.transform(address) || this.shortenStringPipe.transform(address)

    if (!options) {
      return getAliasOrShorten()
    }

    if (options.showAlliasOrFullAddress) {
      return this.aliasPipe.transform(address) || address
    }

    if (options.showFullAddress) {
      return address
    }

    return getAliasOrShorten()
  }
}
