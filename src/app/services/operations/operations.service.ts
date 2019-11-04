import { Injectable } from '@angular/core'
import { DelegationInfo, TezosKtProtocol } from 'airgap-coin-lib'
import { Transaction } from '../../interfaces/Transaction'
import { TezosRewards, TezosProtocol } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  constructor() {}

  public async checkDelegated(address: string): Promise<DelegationInfo> {
    const protocol = new TezosKtProtocol()

    return protocol.isAddressDelegated(address)
  }

  public async getRewards(address: string, transaction: Transaction): Promise<TezosRewards> {
    const protocol = new TezosProtocol()

    return protocol.calculateRewards(address, transaction.cycle)
  }
}
