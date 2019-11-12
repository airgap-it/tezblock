import { Injectable, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ChainNetworkService implements OnInit {
  public url: string
  constructor() {}

  private getEnvironmentUrl(): string {
    const rawUrl = window.location
    this.url = rawUrl.hostname

    //TODO remove
    this.url = 'carthagenet'
    //end remove

    return this.url
  }

  public getEnvironment() {
    const url = this.getEnvironmentUrl()
    if (url === 'babylonnet') {
      console.log('babylonnet')
      return environment.babylonnet
    } else if (url === 'carthagenet') {
      console.log('carthagenet')
      return environment.carthagenet
    } else {
      console.log('mainnet')
      return environment.mainnet
    }
  }
  public getEnvironmentVariable(): string {
    return this.url
  }

  public ngOnInit() {}
}
