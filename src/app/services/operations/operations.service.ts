import { Injectable } from '@angular/core'
import { DelegationInfo, TezosKtProtocol } from 'airgap-coin-lib'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { Transaction } from '../../interfaces/Transaction'
import { TezosRewards, TezosProtocol } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  constructor(public readonly chainNetworkService: ChainNetworkService) {}

  public async checkDelegated(address: string): Promise<DelegationInfo> {
    const environmentUrls = this.chainNetworkService.getEnvironment()
    const protocol = new TezosKtProtocol(
      environmentUrls.rpcUrl,
      environmentUrls.conseilUrl,
      this.chainNetworkService.getNetwork(),
      this.chainNetworkService.getEnvironmentVariable(),
      environmentUrls.conseilApiKey
    )

    return protocol.isAddressDelegated(address)
  }

  public async getRewards(address: string, transaction: Transaction): Promise<TezosRewards> {
    const environmentUrls = this.chainNetworkService.getEnvironment()
    const protocol = new TezosProtocol(
      environmentUrls.rpcUrl,
      environmentUrls.conseilUrl,
      this.chainNetworkService.getNetwork(),
      this.chainNetworkService.getEnvironmentVariable(),
      environmentUrls.conseilApiKey
    )

    return protocol.calculateRewards(address, transaction.cycle)
  }
}
