import { Injectable } from '@angular/core'
import {
  DAppClient,
  NetworkType,
  OperationResponseOutput,
  RequestPermissionInput,
  TezosDelegationOperation,
  TezosOperationType
} from '@airgap/beacon-sdk'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

const tezosNetworkToNetworkType = (tezosNetwork: TezosNetwork): NetworkType => {
  switch (tezosNetwork) {
    case TezosNetwork.MAINNET:
      return NetworkType.MAINNET
    case TezosNetwork.CARTHAGENET:
      return NetworkType.CARTHAGENET
    default:
      return NetworkType.CUSTOM
  }
}

@Injectable({
  providedIn: 'root'
})
export class BeaconService {
  constructor(private readonly chainNetworkService: ChainNetworkService) {}

  async delegate(address: string): Promise<OperationResponseOutput> {
    const client = this.getDAppClient()
    const requestPermissions = async () => {
      const input: RequestPermissionInput = {
        network: {
          type: tezosNetworkToNetworkType(this.chainNetworkService.getNetwork())
        }
      }

      await client.requestPermissions(input)
    }

    // Check if we have permissions stored locally already
    const activeAccount = await client.getActiveAccount()

    if (!activeAccount) {
      // If no active account is set, we have to ask for permissions.
      // After this call, the SDK saves the permissions locally
      await requestPermissions()
    }

    const operation: Partial<TezosDelegationOperation> = {
      kind: TezosOperationType.DELEGATION,
      delegate: address
    }

    return client.requestOperation({
      operationDetails: [operation]
    })
  }

  // for testing (mainly)
  getDAppClient(): DAppClient {
    return new DAppClient({ name: 'tezblock' })
  }
}
