import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of, timer } from 'rxjs'
import { delayWhen, map, retryWhen, tap } from 'rxjs/operators'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseService, ENVIRONMENT_URL } from '@tezblock/services/base.service'

export interface ProtocolConstantResponse {
  proof_of_work_nonce_size: number
  nonce_length: number
  max_revelations_per_block: number
  max_operation_data_length: number
  max_proposals_per_delegate: number
  preserved_cycles: number
  blocks_per_cycle: number
  blocks_per_commitment: number
  blocks_per_roll_snapshot: number
  blocks_per_voting_period: number
  time_between_blocks: string[]
  endorsers_per_block: number
  hard_gas_limit_per_operation: string
  hard_gas_limit_per_block: string
  proof_of_work_threshold: string
  tokens_per_roll: string
  michelson_maximum_type_size: number
  seed_nonce_revelation_tip: string
  origination_size: number
  block_security_deposit: string
  endorsement_security_deposit: string
  block_reward: string
  endorsement_reward: string
  cost_per_byte: string
  hard_storage_limit_per_operation: string
  test_chain_duration: string
  quorum_min: number
  quorum_max: number
  min_proposal_quorum: number
  initial_endorsers: number
  delay_per_missing_endorsement: string
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolVariablesService extends BaseService {
  constructor(
    readonly chainNetworkService: ChainNetworkService,
    readonly httpClient: HttpClient
  ) {
    super(chainNetworkService, httpClient)
  }

  getProtocolVariables(): Observable<ProtocolConstantResponse> {
    if (this._protocolVariables) {
      return of(this._protocolVariables)
    }

    if (this._getProtocolVariables) {
      return this._getProtocolVariables
    }

    return (this._getProtocolVariables = this.get<any>(`${ENVIRONMENT_URL.rpcUrl}/chains/main/blocks/head/context/constants`, true)
      .pipe(
        map(protocolConstantResponse => {
          if (!protocolConstantResponse) {
            throw new Error('Empty response')
          }

          return protocolConstantResponse
        }),
        tap(protocolVariables => this._protocolVariables = protocolVariables),
        // TODO: study more: https://blog.danlew.net/2016/01/25/rxjavas-repeatwhen-and-retrywhen-explained/
        retryWhen(errors =>
          errors.pipe(
            //retry in 3 seconds
            delayWhen(() => timer(3 * 1000))
          )
        )
      ))
  }

  private _getProtocolVariables: Observable<ProtocolConstantResponse>
  private _protocolVariables: ProtocolConstantResponse
}
