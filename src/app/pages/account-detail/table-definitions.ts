import { OperationTypes } from '@tezblock/domain/operations';
import {
  Column,
  Template,
  blockAndTxHashColumns,
} from '@tezblock/components/tezblock-table/tezblock-table.component';
import { Transaction } from '@tezblock/interfaces/Transaction';
import { ContractAsset } from './model';
import { isConvertableToUSD } from '@tezblock/domain/airgap';
import { TranslateService } from '@ngx-translate/core';

export const columns: {
  [key: string]: (options: any, translateService: TranslateService) => Column[];
} = {
  [OperationTypes.Transaction]: (
    options: any,
    translateService: TranslateService
  ) =>
    [
      {
        name: translateService.instant('tezblock-table.transaction.from'),
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.source,
          options: { showFullAddress: false, pageId: options.pageId },
        }),
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        data: (item: Transaction) => ({ data: item.outgoing }),
      },
      {
        name: translateService.instant('tezblock-table.transaction.to'),
        field: 'destination',
        width: '1',
        data: (item: Transaction) => ({
          data: item.destination,
          options: { showFullAddress: false, pageId: options.pageId },
        }),
        template: Template.address,
      },
      {
        name: translateService.instant('tezblock-table.transaction.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true,
      },
      {
        name: translateService.instant('tezblock-table.transaction.amount'),
        field: 'amount',
        data: (item: Transaction) => ({
          data: item.amount,
          options: {
            ...options,
            comparisonTimestamp: item.timestamp,
            symbol: item.symbol,
            showFiatValue: !item.symbol || isConvertableToUSD(item.symbol),
          },
        }),
        template: Template.amount,
        sortable: true,
      },
      {
        name: translateService.instant('tezblock-table.transaction.fee'),
        field: 'fee',
        data: (item: Transaction) => ({
          data: item.fee,
          options: {
            showFiatValue: false,
            comparisonTimestamp: item.timestamp,
            digitsInfo: '1.2-8',
          },
        }),
        template: Template.amount,
        sortable: true,
      },
    ].concat(<any>blockAndTxHashColumns(translateService)),

  [OperationTypes.Delegation]: (
    options: any,
    translateService: TranslateService
  ) =>
    [
      {
        name: translateService.instant('tezblock-table.delegation.delegator'),
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.source,
          options: { showFullAddress: false, pageId: options.pageId },
        }),
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        data: (item: Transaction) => ({ data: item.outgoing }),
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
            isText: !item.delegate ? true : undefined,
          },
        }),
      },
      {
        name: translateService.instant('tezblock-table.delegation.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true,
      },
      {
        name: translateService.instant('tezblock-table.delegation.amount'),
        field: 'delegatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({
          data: item.delegatedBalance,
          options: { ...options, comparisonTimestamp: item.timestamp },
        }),
        sortable: false, // delegatedBalance is joined property from accounts
      },
    ].concat(<any>blockAndTxHashColumns(translateService)),

  [OperationTypes.Origination]: (
    options: any,
    translateService: TranslateService
  ) =>
    [
      {
        name: translateService.instant(
          'tezblock-table.origination.new-account'
        ),
        field: 'originated_contracts',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.originated_contracts,
          options: { showFullAddress: false, pageId: options.pageId },
        }),
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
        name: translateService.instant('tezblock-table.origination.age'),
        field: 'timestamp',
        template: Template.timestamp,
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
      },
      {
        name: translateService.instant('tezblock-table.origination.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({
          data: item.fee,
          options: {
            showFiatValue: false,
            comparisonTimestamp: item.timestamp,
            digitsInfo: '1.2-8',
          },
        }),
        sortable: true,
      },
    ].concat(<any>blockAndTxHashColumns(translateService)),

  [OperationTypes.Endorsement]: (
    options: any,
    translateService: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.endorsement.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.endorsement.slots'),
      field: 'slots',
      sortable: false,
    },
    {
      name: translateService.instant(
        'tezblock-table.endorsement.endorsed-level'
      ),
      field: 'level',
      template: Template.block,
    },
    {
      name: translateService.instant('tezblock-table.endorsement.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.endorsement.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({
        data: item.operation_group_hash,
        options: { kind: 'endorsement' },
      }),
    },
  ],

  [OperationTypes.Ballot]: (options: any, translateService: TranslateService) =>
    [
      {
        name: translateService.instant('tezblock-table.ballot.ballot'),
        field: 'ballot',
      },
      {
        name: translateService.instant('tezblock-table.ballot.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true,
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
        name: translateService.instant('tezblock-table.ballot.proposal-hash'),
        field: 'proposal',
        template: Template.hash,
        data: (item: Transaction) => ({
          data: item.proposal,
          options: { kind: 'proposal' },
        }),
      },
    ].concat(<any>blockAndTxHashColumns(translateService)),

  [OperationTypes.Contract]: (
    options: any,
    translateService: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.contract.asset'),
      template: Template.address,
      data: (item: ContractAsset) => ({
        data: item.contract.id,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      name: translateService.instant('tezblock-table.contract.balance'),
      field: 'amount',
      template: Template.amount,
      data: (item: ContractAsset) => ({
        data: item.amount,
        options: {
          showFiatValue: isConvertableToUSD(item.contract.symbol),
          symbol: item.contract.symbol,
        },
      }),
    },
  ],
  [OperationTypes.Collectibles]: (
    options: any,
    translateService: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.contract.asset'),
      template: Template.address,
      data: (item: ContractAsset) => ({
        data: item.contract.id,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      name: translateService.instant('tezblock-table.contract.balance'),
      field: 'amount',
      template: Template.amount,
      data: (item: ContractAsset) => ({
        data: item.amount,
        options: {
          showFiatValue: isConvertableToUSD(item.contract.symbol),
          symbol: item.contract.symbol,
        },
      }),
    },
  ],
};
