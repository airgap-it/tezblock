import {
  Column,
  Template,
} from '@tezblock/components/tezblock-table/tezblock-table.component';
import { TranslateService } from '@ngx-translate/core';

export interface Options {
  pageId: string;
  showFiatValue: boolean;
  symbol: string;
  decimals?: number;
}

export const columns: {
  [key: string]: (
    options?: Options,
    translateService?: TranslateService
  ) => Column[];
} = {
  transfers: (options: Options, translateService?: TranslateService) => [
    {
      name: 'From',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: any) => ({
        data: item.source,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      field: '',
      width: '1',
      template: Template.symbol,
    },
    {
      name: translateService.instant('tezblock-table.transfers.to'),
      field: 'destination',
      width: '1',
      template: Template.address,
      data: (item: any) => ({
        data: item.destination,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      name: translateService.instant('tezblock-table.transfers.amount'),
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({
        data: item.amount,
        options: {
          showFiatValue: options.showFiatValue,
          symbol: options.symbol,
          decimals: options.decimals,
        },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.transfers.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: any) => ({
        data: item.fee,
        options: { showFiatValue: false, digitsInfo: '1.2-8' },
      }),
      sortable: false,
    },
    {
      name: translateService.instant('tezblock-table.transfers.age'),
      field: 'timestamp',
      template: Template.timestamp,
      data: (item: any) => ({ data: item.timestamp }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transfers.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transfers.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
    },
  ],
  other: (options: Options, translateService?: TranslateService) => [
    {
      name: translateService.instant('tezblock-table.transfers.from'),
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: any) => ({
        data: item.source,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      field: '',
      width: '1',
      template: Template.symbol,
    },
    {
      name: translateService.instant('tezblock-table.transfers.to'),
      field: 'destination',
      width: '1',
      template: Template.address,
      data: (item: any) => ({
        data: item.destination,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      name: translateService.instant('tezblock-table.transfers.amount'),
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({
        data: item.amount,
        options: {
          showFiatValue: options.showFiatValue,
          symbol: options.symbol,
        },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transfers.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: any) => ({
        data: item.fee,
        options: { showFiatValue: false, digitsInfo: '1.2-8' },
      }),
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transfers.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transfers.entrypoint'),
      field: 'entrypoint',
    },
    {
      name: translateService.instant('tezblock-table.transfers.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true,
    },
    {
      name: translateService.instant('tezblock-table.transfers.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
    },
  ],
  entrypoints: (options?: Options) => [
    {
      name: 'Entrypoint',
      data: (item: string) => ({ data: item }),
    },
  ],
  tokenHolders: (options: Options) => [
    {
      name: 'Account',
      field: 'address',
      template: Template.address,
      data: (item: any) => ({
        data: item.address,
        options: { showFullAddress: false, pageId: options.pageId },
      }),
    },
    {
      name: 'Token Balance',
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({
        data: item.amount,
        options: {
          showFiatValue: options.showFiatValue,
          symbol: options.symbol,
        },
      }),
    },
  ],
};
