import { Injectable, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ChainNetworkService implements OnInit {
  private chainName: string
  private defaultChain: string = 'mainnet'
  private readonly supportedChains = ['mainnet', 'babylonnet', 'carthagenet']
  
  constructor() {
    const origin = new URL(location.href).origin
    console.log(origin)
    switch (origin) {
      case environment.mainnet.targetUrl:
        this.chainName = 'mainnet'
        break;
      case environment.babylonnet.targetUrl:
        this.chainName = 'babylonnet'
        break;
      case environment.carthagenet.targetUrl:
        this.chainName = 'carthagenet'
        break;
      default:
        this.chainName = this.defaultChain
        break;
    }
  }

  public getEnvironment(chainName: string = this.chainName) { 
    if (chainName === 'babylonnet') {
      return environment.babylonnet
    } else if (chainName === 'carthagenet') {
      return environment.carthagenet
    } else {
      return environment.mainnet
    }
  }

  public getEnvironmentVariable(): string {
    return "mainnet"
    // return this.chainName
  }

  public changeEnvironment(name: string) {
    if (this.supportedChains.includes(name)) {
      const currentEnvironment = this.getEnvironment(name)
      window.open(currentEnvironment.targetUrl, '_self')
    } else {
      console.error('unsupported network: ', name)
    }
  }

  public ngOnInit() {}
}
