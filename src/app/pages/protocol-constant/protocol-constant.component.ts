import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Block } from '@tezblock/interfaces/Block'
import { BlockService } from '@tezblock/services/blocks/blocks.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

@Component({
  selector: 'protocol-constant',
  templateUrl: './protocol-constant.component.html',
  styleUrls: ['./protocol-constant.component.scss']
})
export class ProtocolConstantComponent implements OnInit {
  public environmentUrls = this.chainNetworkService.getEnvironment()
  public environmentVariable = this.chainNetworkService.getEnvironmentVariable()

  private readonly rpcUrl = `${this.environmentUrls.rpcUrl}`

  public maximumRevelationsPerBlock
  public blocksPerCyle
  // "max_revelations_per_block": 32,
  // "max_operation_data_length": 16384,
  // "blocks_per_cycle": 4096,
  // "blocks_per_commitment": 32,
  // "blocks_per_roll_snapshot": 256,
  // "time_between_blocks": [
  //     "60",
  //     "40"
  // ],
  // "hard_gas_limit_per_operation": "800000",
  // "hard_gas_limit_per_block": "8000000",

  constructor(
    private readonly http: HttpClient,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly blockService: BlockService
  ) {
    this.getData()
  }

  ngOnInit() {}

  public getData() {
    this.blockService.getLatest(1).subscribe((blocks: Block[]) => {
      const blockId = blocks[0].level

      return new Promise(resolve => {
        this.http.get(`${this.rpcUrl}/chains/main/blocks/${blockId}/context/constants`).subscribe((response: any) => {
          if (response !== null) {
            resolve({ status: 'success' })
            this.maximumRevelationsPerBlock = response.max_revelations_per_block
            this.blocksPerCyle = response.blocks_per_cycle
            console.log('maximumRevelationsPerBlock: ', this.maximumRevelationsPerBlock)
          } else {
            resolve({ status: 'error' })
          }
        })
      })
    })
  }
}
