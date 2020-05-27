import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

export interface Column {
  key: string
  description: string
}

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.scss']
})
export class GlossaryComponent implements OnInit {
  searchText: string
  constructor(private translateService: TranslateService) {}

  ngOnInit() {}

  definitions = [
    [
      this.translateService.instant('glossary-additional-terms.account'),
      this.translateService.instant('glossary-additional-terms.account_description')
    ],

    [this.translateService.instant('glossary-additional-terms.amount'), [this.translateService.instant('account-detail.amount_tooltip')]],
    [this.translateService.instant('glossary-additional-terms.baker'), [this.translateService.instant('account-detail.baker_tooltip')]],
    [
      this.translateService.instant('glossary-additional-terms.baker-split'),
      [this.translateService.instant('account-detail.baker-split_tooltip')]
    ],
    [
      this.translateService.instant('glossary-additional-terms.baking-endorsing-rights'),
      this.translateService.instant('glossary-additional-terms.baking-endorsing-rights_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.block'),
      this.translateService.instant('glossary-additional-terms.block_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.block-hash'),
      this.translateService.instant('glossary-additional-terms.block-hash_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.block-height'),
      this.translateService.instant('block-detail.block-height_tooltip')
    ],
    [this.translateService.instant('glossary-additional-terms.cycle'), this.translateService.instant('block-detail.cycle_tooltip')],
    [
      this.translateService.instant('glossary-additional-terms.delegate'),
      this.translateService.instant('glossary-additional-terms.delegate_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.delegation'),
      this.translateService.instant('glossary-additional-terms.delegation_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.delegated-account'),
      [this.translateService.instant('account-detail.delegated-account_tooltip')]
    ],
    [
      this.translateService.instant('glossary-additional-terms.double-baking'),
      this.translateService.instant('glossary-additional-terms.double-baking_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.endorser'),
      this.translateService.instant('glossary-additional-terms.endorser_description')
    ],
    [this.translateService.instant('glossary-additional-terms.fitness'), this.translateService.instant('block-detail.fitness_tooltip')],
    [
      this.translateService.instant('glossary-additional-terms.frozen-balance'),
      this.translateService.instant('glossary-additional-terms.frozen-balance_description')
    ],

    [
      this.translateService.instant('glossary-additional-terms.gas'),
      this.translateService.instant('glossary-additional-terms.gas_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.node'),
      this.translateService.instant('glossary-additional-terms.node_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.operation'),
      this.translateService.instant('glossary-additional-terms.operation_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.originated-account'),
      this.translateService.instant('glossary-additional-terms.originated-account_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.origination'),
      this.translateService.instant('glossary-additional-terms.origination_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.priority'),
      this.translateService.instant('glossary-additional-terms.priority_description')
    ],
    [this.translateService.instant('glossary-additional-terms.protocol'), this.translateService.instant('block-detail.protocol_tooltip')],
    [
      this.translateService.instant('glossary-additional-terms.related-accounts'),
      [this.translateService.instant('account-detail.related-accounts_tooltip')]
    ],
    [
      this.translateService.instant('glossary-additional-terms.reveal'),
      this.translateService.instant('glossary-additional-terms.reveal_description')
    ],

    [
      this.translateService.instant('glossary-additional-terms.reward'),
      [this.translateService.instant('account-detail.reward-amount_tooltip')]
    ],
    [
      this.translateService.instant('glossary-additional-terms.roll'),
      this.translateService.instant('glossary-additional-terms.roll_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.signature'),
      this.translateService.instant('glossary-additional-terms.signature_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.smart-contract'),
      this.translateService.instant('glossary-additional-terms.smart-contract_description')
    ],
    [
      this.translateService.instant('glossary-additional-terms.transaction'),
      this.translateService.instant('glossary-additional-terms.transaction_description')
    ],

    [
      this.translateService.instant('glossary-additional-terms.transaction-hash'),
      [this.translateService.instant('transaction-detail.transaction-hash_tooltip')]
    ]
  ]
}
