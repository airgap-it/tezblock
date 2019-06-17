import { Injectable } from '@angular/core'
import { DelegationInfo, TezosKtProtocol } from 'airgap-coin-lib'

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  constructor() {}

  public async checkDelegated(address: string): Promise<DelegationInfo> {
    const protocol = new TezosKtProtocol()

    return protocol.isAddressDelegated(address)
  }
}
