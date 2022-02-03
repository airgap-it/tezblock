import {
  TezosNetwork,
  NetworkType,
  TezblockBlockExplorer,
  TezosProtocolNetwork,
  TezosProtocolNetworkExtras,
  ProtocolNetwork,
} from '@airgap/coinlib-core';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChainNetworkService implements OnInit {
  private chainName: TezosNetwork;
  private defaultChain: TezosNetwork = TezosNetwork.MAINNET;
  private readonly supportedChains = [
    TezosNetwork.MAINNET,
    TezosNetwork.GRANADANET,
  ];

  constructor() {
    const origin = new URL(location.href).origin;
    switch (origin) {
      case environment.mainnet.targetUrl:
        this.chainName = TezosNetwork.MAINNET;
        break;
      case environment.granadanet.targetUrl:
        this.chainName = TezosNetwork.GRANADANET;
        break;
      default:
        const originComponents = origin.split('.');
        if (originComponents.length > 0) {
          const nameComponents = originComponents[0].split('-');
          if (nameComponents.length > 1) {
            const networkName = nameComponents[1];
            const index = this.supportedChains.indexOf(
              networkName as TezosNetwork
            );
            if (index >= 0) {
              this.chainName = this.supportedChains[index];
              break;
            }
          }
        }
        this.chainName = this.defaultChain;
        break;
    }
  }

  public getEnvironment(chainName: TezosNetwork = this.chainName) {
    return environment[chainName] ?? environment.mainnet;
  }

  public getEnvironmentVariable(): string {
    // return this.chainName;
    return 'mainnet';
  }

  public getNetwork(): TezosNetwork {
    return this.chainName;
  }

  public changeEnvironment(name: TezosNetwork) {
    if (this.supportedChains.includes(name)) {
      const currentEnvironment = this.getEnvironment(name);
      window.open(currentEnvironment.targetUrl, '_self');
    } else {
      console.error('unsupported network: ', name);
    }
  }

  public ngOnInit() {}
}
