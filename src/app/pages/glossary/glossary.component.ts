import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.scss'],
})
export class GlossaryComponent implements OnInit {
  searchText: string;
  constructor(private translateService: TranslateService) {}

  ngOnInit() {}

  definitions: Column[] = [
    {
      name: this.translateService.instant('glossary-additional-terms.account'),
      field: this.translateService.instant(
        'glossary-additional-terms.account_description'
      ),
    },

    {
      name: this.translateService.instant('glossary-additional-terms.amount'),
      field: this.translateService.instant('account-detail.amount_tooltip'),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.baker'),
      field: this.translateService.instant('account-detail.baker_tooltip'),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.baker-split'
      ),
      field: this.translateService.instant(
        'account-detail.baker-split_tooltip'
      ),
    },

    {
      name: this.translateService.instant(
        'glossary-additional-terms.baking-endorsing-rights'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.baking-endorsing-rights_description'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.block'),
      field: this.translateService.instant(
        'glossary-additional-terms.block_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.block-hash'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.block-hash_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.block-height'
      ),
      field: this.translateService.instant('block-detail.block-height_tooltip'),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.cycle'),
      field: this.translateService.instant('block-detail.cycle_tooltip'),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.delegate'),
      field: this.translateService.instant(
        'glossary-additional-terms.delegate_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.delegation'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.delegation_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.delegated-account'
      ),
      field: this.translateService.instant(
        'account-detail.delegated-account_tooltip'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.double-baking'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.double-baking_description'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.endorser'),
      field: this.translateService.instant(
        'glossary-additional-terms.endorser_description'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.fitness'),
      field: this.translateService.instant('block-detail.fitness_tooltip'),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.frozen-balance'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.frozen-balance_description'
      ),
    },

    {
      name: this.translateService.instant('glossary-additional-terms.gas'),
      field: this.translateService.instant(
        'glossary-additional-terms.gas_description'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.node'),
      field: this.translateService.instant(
        'glossary-additional-terms.node_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.operation'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.operation_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.originated-account'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.originated-account_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.origination'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.origination_description'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.priority'),
      field: this.translateService.instant(
        'glossary-additional-terms.priority_description'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.protocol'),
      field: this.translateService.instant('block-detail.protocol_tooltip'),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.related-accounts'
      ),
      field: this.translateService.instant(
        'account-detail.related-accounts_tooltip'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.reveal'),
      field: this.translateService.instant(
        'glossary-additional-terms.reveal_description'
      ),
    },

    {
      name: this.translateService.instant('glossary-additional-terms.reward'),
      field: this.translateService.instant(
        'account-detail.reward-amount_tooltip'
      ),
    },
    {
      name: this.translateService.instant('glossary-additional-terms.roll'),
      field: this.translateService.instant(
        'glossary-additional-terms.roll_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.signature'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.signature_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.smart-contract'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.smart-contract_description'
      ),
    },
    {
      name: this.translateService.instant(
        'glossary-additional-terms.transaction'
      ),
      field: this.translateService.instant(
        'glossary-additional-terms.transaction_description'
      ),
    },

    {
      name: this.translateService.instant(
        'glossary-additional-terms.transaction-hash'
      ),
      field: this.translateService.instant(
        'transaction-detail.transaction-hash_tooltip'
      ),
    },
  ];
}
