import { Injectable, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ChainNetworkService implements OnInit {
  ngOnInit(): void {}

  public url: string
  constructor(private readonly router: Router) {
    this.url = this.router.url
  }

  private getEnvironmentUrl(): string {
    this.url = 'mainnet'

    return this.url
  }

  public getEnvironment() {
    const url = this.getEnvironmentUrl()
    if (url === 'babylon') {
      return environment.babylonnet
    }
    if (url === 'mainnet') {
      return environment.mainnet
    }
  }
}
