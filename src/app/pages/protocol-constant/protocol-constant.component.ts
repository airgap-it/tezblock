import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Block } from '@tezblock/interfaces/Block'
import { BlockService } from '@tezblock/services/blocks/blocks.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

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
@Component({
  selector: 'protocol-constant',
  templateUrl: './protocol-constant.component.html',
  styleUrls: ['./protocol-constant.component.scss']
})
export class ProtocolConstantComponent implements OnInit {
  public environmentUrls = this.chainNetworkService.getEnvironment()
  public environmentVariable = this.chainNetworkService.getEnvironmentVariable()

  private readonly rpcUrl = `${this.environmentUrls.rpcUrl}`

  public maximumRevelationsPerBlock: number
  public blocksPerCyle: number
  public blocksPerCommitment: number
  public blocksPerRollSnapshot: number
  public timeBetweenBlocks: string[]
  public maximumOperationDataLength: number
  public hardGasLimitPerOperation: string
  public hardGasLimitPerBlock: string
  public blockSecurityDeposit: string
  public endorsementSecurityDeposit: string
  public timeBetweenPriority
  constructor(
    private readonly http: HttpClient,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly blockService: BlockService
  ) {
    this.getData()
  }

  ngOnInit() {}

  public getData() {
    this.blockService.getLatest().subscribe((block: Block) => {
      const blockId = block.level

      return new Promise(resolve => {
        this.http
          .get<ProtocolConstantResponse>(`${this.rpcUrl}/chains/main/blocks/${blockId}/context/constants`)
          .subscribe((response: ProtocolConstantResponse) => {
            if (response !== null) {
              resolve({ status: 'success' })
              this.blocksPerCyle = response.blocks_per_cycle
              this.blocksPerCommitment = response.blocks_per_commitment
              this.blocksPerRollSnapshot = response.blocks_per_roll_snapshot
              this.timeBetweenBlocks = response.time_between_blocks
              this.blockSecurityDeposit = response.block_security_deposit
              this.endorsementSecurityDeposit = response.endorsement_security_deposit
              this.maximumRevelationsPerBlock = response.max_revelations_per_block
              this.maximumOperationDataLength = response.max_operation_data_length
              this.hardGasLimitPerOperation = response.hard_gas_limit_per_operation
              this.hardGasLimitPerBlock = response.hard_gas_limit_per_block
            } else {
              resolve({ status: 'error' })
            }
          })

        this.http
          .get(`${this.rpcUrl}/chains/main/blocks/${blockId}/minimal_valid_time?[priority=0]&[endorsing_power=32]`)
          .subscribe((response: any) => {
            if (response !== null) {
              let timestampString = response
              timestampString = new Date(timestampString)
              const now = new Date()
              // TODO: most likely wrong value, deactivated for now
              this.timeBetweenPriority = (timestampString.getTime() - now.getTime()) / 1000
            } else {
              resolve({ status: 'error' })
            }
          })
      })
    })
  }
}
