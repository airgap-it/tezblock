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
    const envName = this.getEnvironmentFromUrl()
    if (envName === 'babylonnet') {
      console.log('babylonnet')
      return environment.babylonnet
    } else if (envName === 'carthagenet') {
      console.log('carthagenet')
      return environment.carthagenet
    } else {
      console.log('mainnet')
      return environment.mainnet
    }
  }
  public getEnvironmentVariable(): string {
    if (this.chainName === 'carthagenet') {
      return 'mainnet'
    } else {
      return this.chainName
    }
  }

  public ngOnInit() {}
}
