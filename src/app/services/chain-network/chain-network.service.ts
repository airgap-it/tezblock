import { Injectable, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ChainNetworkService implements OnInit {
  private chainName: string
  private defaultChain: string = 'mainnet'
  private readonly supportedChains = ['mainnet', 'babylonnet', 'carthagenet']
  constructor() {}

  private getEnvironmentFromUrl(): string {
    const hostname = window.location.hostname
    const indexOfFirstDot = hostname.indexOf('.')
    if (indexOfFirstDot !== -1) {
      const name = hostname.substr(0, indexOfFirstDot).toLowerCase()
      if (this.supportedChains.indexOf(name) !== -1) {
        this.chainName = name
      } else {
        this.chainName = this.defaultChain
      }
    } else {
      this.chainName = this.defaultChain
    }

    return this.chainName
  }

  public getEnvironment() {
    // const envName = this.getEnvironmentFromUrl()
    if (this.chainName === 'babylonnet') {
      console.log('babylonnet')
      return environment.babylonnet
    } else if (this.chainName === 'carthagenet') {
      console.log('carthagenet')
      return environment.carthagenet
    } else {
      console.log('mainnet')
      return environment.mainnet
    }
  }
  public getEnvironmentVariable(): string {
    const ChainName = this.getEnvironmentFromUrl()
    if (ChainName === 'mainnet') {
      return 'mainnet'
    } else {
      return ChainName
    }
  }

  public changeEnvironment(name: string) {
    if (this.supportedChains.includes(name)) {
      this.chainName = name

      const currentEnvironment = this.getEnvironment()
      window.open(currentEnvironment.targetUrl, '_self')
    } else {
      console.error('unsupported network: ', name)
    }
  }

  public ngOnInit() {}
}
