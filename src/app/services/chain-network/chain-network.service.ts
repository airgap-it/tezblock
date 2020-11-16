import { Injectable, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

@Injectable({
  providedIn: 'root'
})
export class ChainNetworkService implements OnInit {
  private chainName: TezosNetwork
  private defaultChain: TezosNetwork = TezosNetwork.DELPHINET
  private readonly supportedChains = [TezosNetwork.MAINNET, TezosNetwork.CARTHAGENET, TezosNetwork.DELPHINET]

  constructor() {
    const origin = new URL(location.href).origin
    switch (origin) {
      case environment.mainnet.targetUrl:
        this.chainName = TezosNetwork.MAINNET
        break
      case environment.carthagenet.targetUrl:
        this.chainName = TezosNetwork.CARTHAGENET
        break
      case environment.delphinet.targetUrl:
        this.chainName = TezosNetwork.DELPHINET
        break
      default:
        this.chainName = this.defaultChain
        break
    }
  }

  public getEnvironment(chainName: TezosNetwork = this.chainName) {
    switch (chainName) {
      case TezosNetwork.MAINNET:
        return environment.mainnet
      case TezosNetwork.CARTHAGENET:
        return environment.carthagenet
      case TezosNetwork.DELPHINET:
        return environment.delphinet
      default:
        return environment.mainnet
    }
  }

  public getEnvironmentVariable(): string {
    return this.chainName
  }

  public getNetwork(): TezosNetwork {
    return this.chainName
  }

  public changeEnvironment(name: TezosNetwork) {
    if (this.supportedChains.includes(name)) {
      const currentEnvironment = this.getEnvironment(name)
      window.open(currentEnvironment.targetUrl, '_self')
    } else {
      console.error('unsupported network: ', name)
    }
  }

  public ngOnInit() {}
}
