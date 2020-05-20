import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { TranslateService } from '@ngx-translate/core'

export const columns: { [key: string]: (options: { pageId: string; showFiatValue: boolean; translate?: any }) => Column[] } = {
  [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.transaction.from'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      field: 'applied',
      width: '1',
      template: Template.symbol,
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.transaction.to'),
      field: 'destination',
      width: '1',
      data: (item: Transaction) => ({ data: item.destination, options: { showFullAddress: false, pageId: options.pageId } }),
      template: Template.address,
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.transaction.amount'),
      field: 'amount',
      data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options }),
      template: Template.amount,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transaction.fee'),
      field: 'fee',
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: true } }),
      template: Template.amount,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transaction.gas-limit'),
      field: 'gas_limit',
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.transaction.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash }),
      sortable: false
    }
  ],

  [OperationTypes.Delegation]: (options: { pageId: string; showFiatValue: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.delegation.delegator'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      field: 'applied',
      width: '1',
      template: Template.symbol,
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.delegation.baker'),
      field: 'delegate',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.delegate || 'undelegate',
        options: { showFullAddress: false, pageId: options.pageId, isText: !item.delegate ? true : undefined }
      }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.delegation.amount'),
      field: 'delegatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.delegatedBalance, timestamp: item.timestamp }, options }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.delegation.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: true } }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.delegation.gas-limit'),
      field: 'gas_limit',
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.delegation.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash }),
      sortable: false
    }
  ],

  [OperationTypes.Origination]: (options: { pageId: string; showFiatValue: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.origination.new-account'),
      field: 'originated_contracts',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.origination.balance'),
      field: 'originatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.origination.originator'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.origination.baker'),
      field: 'delegate',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.origination.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: true } }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.origination.burn'),
      field: 'burn',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.burn }, options: { showFiatValue: false } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.origination.gas-limit'),
      field: 'gas_limit',
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.origination.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash }),
      sortable: false
    }
  ],

  [OperationTypes.Endorsement]: (options: { pageId: string; showFiatValue: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.endorsement.endorser'),
      field: 'delegate',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.endorsement.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.endorsement.slots'),
      field: 'slots',
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.endorsement.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } }),
      sortable: false
    }
  ],

  [OperationTypes.Activation]: (options: { pageId: string; showFiatValue: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.activation.account'),
      field: 'pkh',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.activation.secret'),
      field: 'secret',
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.activation.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash }),
      sortable: false
    }
  ]
}
