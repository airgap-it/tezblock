import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { TranslateService } from '@ngx-translate/core'

export const columns: {
  [key: string]: (options: { pageId: string; showFiatValue: boolean; symbol: string; translate?: any }) => Column[]
} = {
  transfers: (options: { pageId: string; showFiatValue: boolean; symbol: string; translate?: TranslateService }) => [
    {
      name: 'From',
      field: 'from',
      width: '1',
      template: Template.address,
      data: (item: any) => ({ data: item.from, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      field: '',
      width: '1',
      template: Template.symbol
    },
    {
      name: options.translate.instant('tezblock-table.transfers.to'),
      field: 'to',
      width: '1',
      template: Template.address,
      data: (item: any) => ({ data: item.to, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: options.translate.instant('tezblock-table.transfers.amount'),
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({
        data: item.amount,
        options: {
          showFiatValue: options.showFiatValue,
          symbol: options.symbol
        }
      }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.transfers.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: any) => ({ data: item.fee, options: { showFiatValue: false, digitsInfo: '1.2-8' } }),
      sortable: false
    },
    {
      name: options.translate.instant('tezblock-table.transfers.age'),
      field: 'timestamp',
      template: Template.timestamp,
      data: (item: any) => ({ data: item.timestamp }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transfers.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transfers.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash
    }
  ],
  other: (options: { pageId: string; showFiatValue: boolean; symbol: string; translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.transfers.from'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: any) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      field: '',
      width: '1',
      template: Template.symbol
    },
    {
      name: options.translate.instant('tezblock-table.transfers.to'),
      field: 'destination',
      width: '1',
      template: Template.address,
      data: (item: any) => ({ data: item.destination, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: options.translate.instant('tezblock-table.transfers.amount'),
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({
        data: item.amount,
        options: {
          showFiatValue: options.showFiatValue,
          symbol: options.symbol
        }
      }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transfers.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: any) => ({ data: item.fee, options: { showFiatValue: false, digitsInfo: '1.2-8' } }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transfers.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transfers.entrypoint'),
      field: 'entrypoint'
    },
    {
      name: options.translate.instant('tezblock-table.transfers.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.transfers.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash
    }
  ],
  tokenHolders: (options: { pageId: string; showFiatValue: boolean; symbol: string }) => [
    {
      name: 'Account',
      field: 'address',
      template: Template.address,
      data: (item: any) => ({ data: item.address, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: 'Token Balance',
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({
        data: item.amount,
        options: {
          showFiatValue: options.showFiatValue,
          symbol: options.symbol
        }
      })
    }
  ]
}
