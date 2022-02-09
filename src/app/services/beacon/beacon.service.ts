import { Injectable } from '@angular/core';
import {
  AccountInfo,
  ColorMode,
  DAppClient,
  NetworkType,
  OperationResponseOutput,
  PartialTezosOperation,
  RequestPermissionInput,
  TezosOperationType,
} from '@airgap/beacon-sdk';

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { TezosNetwork } from '@airgap/coinlib-core';

const tezosNetworkToNetworkType = (tezosNetwork: TezosNetwork): NetworkType => {
  switch (tezosNetwork) {
    case TezosNetwork.MAINNET:
      return NetworkType.MAINNET;
    case TezosNetwork.HANGZHOUNET:
      return NetworkType.HANGZHOUNET;
    default:
      return NetworkType.CUSTOM;
  }
};

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  private client: DAppClient;
  constructor(private readonly chainNetworkService: ChainNetworkService) {
    this.client = this.getDAppClient();
  }

  async setupBeaconWallet(): Promise<AccountInfo | undefined> {
    try {
      return await this.getActiveAccount();
    } catch (error) {
      return undefined;
    }
  }
  async getActiveAccount(): Promise<AccountInfo> {
    return this.client.getActiveAccount();
  }

  async connectWallet(): Promise<AccountInfo | undefined> {
    const requestPermissions = async () => {
      const input: RequestPermissionInput = {
        network: {
          type: tezosNetworkToNetworkType(
            this.chainNetworkService.getNetwork()
          ),
        },
      };

      await this.client.requestPermissions(input);
      return this.getActiveAccount();
    };

    // Check if we have permissions stored locally already
    const activeAccount = await this.getActiveAccount();

    if (!activeAccount) {
      // If no active account is set, we have to ask for permissions.
      // After this call, the SDK saves the permissions locally
      const permissions = await requestPermissions();
      return permissions;
    }
    return activeAccount;
  }

  async reset(): Promise<void> {
    await this.client.removeAllAccounts();
  }

  async delegate(address: string): Promise<OperationResponseOutput> {
    const requestPermissions = async () => {
      const input: RequestPermissionInput = {
        network: {
          type: tezosNetworkToNetworkType(
            this.chainNetworkService.getNetwork()
          ),
        },
      };

      await this.client.requestPermissions(input);
    };

    // Check if we have permissions stored locally already
    const activeAccount = await this.getActiveAccount();

    if (!activeAccount) {
      // If no active account is set, we have to ask for permissions.
      // After this call, the SDK saves the permissions locally
      await requestPermissions();
    }

    const operation: PartialTezosOperation = {
      kind: TezosOperationType.DELEGATION,
      delegate: address,
    };

    return this.client.requestOperation({
      operationDetails: [operation],
    });
  }

  async operationRequest(
    operation: PartialTezosOperation[]
  ): Promise<OperationResponseOutput> {
    const requestPermissions = async () => {
      const input: RequestPermissionInput = {
        network: {
          type: tezosNetworkToNetworkType(
            this.chainNetworkService.getNetwork()
          ),
        },
      };

      await this.client.requestPermissions(input);
    };

    // Check if we have permissions stored locally already
    const activeAccount = await this.getActiveAccount();

    if (!activeAccount) {
      // If no active account is set, we have to ask for permissions.
      // After this call, the SDK saves the permissions locally
      await requestPermissions();
    }

    return this.client.requestOperation({
      operationDetails: operation,
    });
  }

  // for testing (mainly)
  getDAppClient(): DAppClient {
    return new DAppClient({ name: 'tezblock' });
  }

  changeTheme(color: ColorMode) {
    this.client.setColorMode(color);
  }
}
