import { OperationTypes } from '@tezblock/domain/operations';
import {
  Column,
  Template,
  blockAndTxHashColumns,
} from '@tezblock/components/tezblock-table/tezblock-table.component';
import { Transaction } from '@tezblock/interfaces/Transaction';
import { TranslateService } from '@ngx-translate/core';
import { isConvertableToUSD } from '@tezblock/domain/airgap';

export const columns: {
  [key: string]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) => Column[];
} = {
  [OperationTypes.Transaction]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.transaction.from'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.source,
        options: { pageId: options.pageId, showFullAddress: false },
      }),
      sortable: false,
    },
    {
      field: 'applied',
      width: '1',
      template: Template.symbol,
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.transaction.to'),
      field: 'destination',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.destination,
        options: { pageId: options.pageId, showFullAddress: false },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.transaction.amount'),
      field: 'amount',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.amount,
        options: {
          maxDigits: 8,
          comparisonTimestamp: item.timestamp,
          symbol: item.symbol,
          showFiatValue: !item.symbol || isConvertableToUSD(item.symbol),
        },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transaction.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: {
          showFiatValue: false,
          maxDigits: 8,
          comparisonTimestamp: item.timestamp,
          digitsInfo: '1.2-8',
        },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transaction.gas-limit'),
      field: 'gas_limit',
      sortable: false,
    },
    {
      name: translateService.instant(
        'tezblock-table.transaction.storage-limit'
      ),
      field: 'storage_limit',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.transaction.parameters'),
      field: 'parameters',
      template: Template.modal,
      data: (item: Transaction) => ({
        data: item.parameters_micheline,
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.transaction.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
  ],

  [OperationTypes.Delegation]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.delegation.delegator'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.source,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
      sortable: false,
    },
    {
      field: 'applied',
      width: '1',
      template: Template.symbol,
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.delegation.baker'),
      field: 'delegate',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.delegate || 'undelegate',
        options: {
          showFullAddress: false,
          pageId: options.pageId,
          isText: item.delegate ? undefined : true,
        },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.delegation.value'),
      field: 'delegatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.delegatedBalance,
        options: { ...options, comparisonTimestamp: item.timestamp },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.delegation.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: {
          showFiatValue: false,
          maxDigits: 8,
          comparisonTimestamp: item.timestamp,
          digitsInfo: '1.2-8',
        },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.delegation.gas-limit'),
      field: 'gas_limit',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.delegation.storage-limit'),
      field: 'storage_limit',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.delegation.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
  ],

  [OperationTypes.Origination]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.origination.new-account'),
      field: 'originated_contracts',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.originated_contracts,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.origination.balance'),
      field: 'originatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.originatedBalance,
        options: { ...options, comparisonTimestamp: item.timestamp },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.origination.originator'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.source,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.origination.baker'),
      field: 'delegate',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.delegate,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.origination.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: {
          showFiatValue: false,
          maxDigits: 8,
          comparisonTimestamp: item.timestamp,
          digitsInfo: '1.2-8',
        },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.origination.burn'),
      field: 'burn',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.burn,
        options: { showFiatValue: false },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.origination.gas-limit'),
      field: 'gas_limit',
      sortable: false,
    },
    {
      name: translateService.instant(
        'tezblock-table.origination.storage-limit'
      ),
      field: 'storage_limit',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.origination.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
  ],

  [OperationTypes.Reveal]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.reveal.account'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.source,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.reveal.public-key'),
      field: 'public_key',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.public_key,
        options: { showFullAddress: false },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.reveal.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: {
          showFiatValue: false,
          maxDigits: 8,
          comparisonTimestamp: item.timestamp,
          digitsInfo: '1.2-8',
        },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.reveal.gas-limit'),
      field: 'gas_limit',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.reveal.storage-limit'),
      field: 'storage_limit',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.reveal.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
  ],

  [OperationTypes.Activation]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) =>
    [
      {
        name: translateService.instant('tezblock-table.activation.account'),
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.pkh,
          options: { showFullAddress: true, pageId: options.pageId },
        }),
        sortable: false,
      },
      {
        name: translateService.instant('tezblock-table.activation.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true,
      },
      {
        name: translateService.instant('tezblock-table.activation.secret'),
        field: 'secret',
        sortable: false,
      },
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Ballot]: (
    options: { pageId: string; showFiatValue: boolean },
    translateService?: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.ballot.baker'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.source,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.ballot'),
      field: 'ballot',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.kind'),
      field: 'kind',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.voting-period'),
      field: 'voting_period',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.number-of-votes'),
      field: 'votes',
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.proposal'),
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({
        data: item.proposal,
        options: { kind: 'proposal' },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.ballot.block'),
      field: 'block_level',
      template: Template.block,
      sortable: false,
    },
  ],
};
