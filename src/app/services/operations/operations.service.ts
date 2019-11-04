import { Injectable } from '@angular/core'
import { DelegationInfo, TezosKtProtocol } from 'airgap-coin-lib'
import { ChainNetworkService } from '../chain-network/chain-network.service'

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  constructor(public readonly chainNetworkService: ChainNetworkService) {}

  public async checkDelegated(address: string): Promise<DelegationInfo> {
    const environmentUrls = this.chainNetworkService.getEnvironment()
    const protocol = new TezosKtProtocol(environmentUrls.rpc, environmentUrls.conseil)

    return protocol.isAddressDelegated(address)
  }
}
