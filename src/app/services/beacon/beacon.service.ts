import { Injectable } from '@angular/core'
import {
  ColorMode,
  DAppClient,
  NetworkType,
  OperationResponseOutput,
  PartialTezosOperation,
  RequestPermissionInput,
  TezosOperationType
} from '@airgap/beacon-sdk'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { TezosNetwork } from '@airgap/coinlib-core'

const tezosNetworkToNetworkType = (tezosNetwork: TezosNetwork): NetworkType => {
  switch (tezosNetwork) {
    case TezosNetwork.MAINNET:
      return NetworkType.MAINNET
    default:
      return NetworkType.CUSTOM
  }
}

@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  private client: DAppClient
  constructor(private readonly chainNetworkService: ChainNetworkService) {
    this.client = this.getDAppClient()
  }

  async delegate(address: string): Promise<OperationResponseOutput> {
    const requestPermissions = async () => {
      const input: RequestPermissionInput = {
        network: {
          type: tezosNetworkToNetworkType(this.chainNetworkService.getNetwork())
        }
      }

      await this.client.requestPermissions(input)
    }

    // Check if we have permissions stored locally already
    const activeAccount = await this.client.getActiveAccount()

    if (!activeAccount) {
      // If no active account is set, we have to ask for permissions.
      // After this call, the SDK saves the permissions locally
      await requestPermissions()
    }

    const operation: PartialTezosOperation = {
      kind: TezosOperationType.DELEGATION,
      delegate: address
    }

    return this.client.requestOperation({
      operationDetails: [operation]
    })
  }

  // for testing (mainly)
  getDAppClient(): DAppClient {
    return new DAppClient({ name: 'tezblock' })
  }

  changeTheme(color: ColorMode) {
    this.client.setColorMode(color)
  }
}
