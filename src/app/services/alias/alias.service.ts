import { Injectable } from '@angular/core';
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe';
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe';
import { Options } from '@tezblock/components/address-item/options';
import { TezosDomains, TezosProtocolNetwork } from '@airgap/coinlib-core';
import { SearchOptionData } from '../search/model';
import { OperationTypes } from '@tezblock/domain/operations';
import { from, Observable } from 'rxjs';
import { of } from 'rxjs';

const TEZOS_DOMAINS_CONTRACT_ADDRESS = 'KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS';

@Injectable({
  providedIn: 'root',
})
export class AliasService {
  domains: TezosDomains | undefined;
  constructor(
    private readonly aliasPipe: AliasPipe,
    private readonly shortenStringPipe: ShortenStringPipe
  ) {
    this.initTezosDomains();
  }

  private initTezosDomains() {
    const network = new TezosProtocolNetwork();
    this.domains = new TezosDomains(network, TEZOS_DOMAINS_CONTRACT_ADDRESS);
  }

  getFormattedAddress(address: string, options?: Options) {
    const getAliasOrShorten = () =>
      this.aliasPipe.transform(address) ||
      this.shortenStringPipe.transform(address);

    if (!options) {
      return getAliasOrShorten();
    }

    if (options.showAlliasOrFullAddress) {
      return this.aliasPipe.transform(address) || address;
    }

    if (options.showFullAddress) {
      return address;
    }

    return getAliasOrShorten();
  }

  tezosDomainsAddressToName(address: string): Promise<string> {
    return this.domains.addressToName(address);
  }

  tezosDomainsNameToAddress(name: string): Observable<any[]> {
    try {
      name = name.endsWith('.tez') ? name : name.concat('.tez');

      return of([
        {
          id: this.domains.nameToAddress(name),
          label: name,
          type: OperationTypes.Account,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }
}
