import { OperationTypes } from '@tezblock/domain/operations';
import {
  Column,
  Template,
  blockAndTxHashColumns,
} from '@tezblock/components/tezblock-table/tezblock-table.component';
import { Transaction } from '@tezblock/interfaces/Transaction';
import { ContractAsset } from '@tezblock/domain/contract';
import { isConvertableToUSD } from '@tezblock/domain/airgap';
import { TranslateService } from '@ngx-translate/core';
import { isCurated } from '@tezblock/domain/account';

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

  [OperationTypes.PortfolioAssets]: (
    options: any,
    translateService: TranslateService
  ) => [
    {
      name: translateService.instant('tezblock-table.portfolio-assets.asset'),
      template: Template.address,
      data: (item: ContractAsset) => ({
        data: item.contract.contractAddress,
        options: {
          useValue: isCurated(item.contract.contractAddress)
            ? undefined
            : item.contract.name,
          showFullAddress: false,
          pageId: options.pageId,
          isContract: true,
          useImgUrl: item.thumbnailUri,
        },
      }),
    },
    {
      name: translateService.instant('tezblock-table.portfolio-assets.balance'),
      field: 'amount',
      template: Template.amount,
      data: (item: ContractAsset) => ({
        data: item.amount,
        options: {
          symbol: item.contract.symbol ?? 'NONE',
          decimals: item?.decimals,
        },
      }),
    },
    {
      name: translateService.instant('tezblock-table.portfolio-assets.value'),
      field: 'amount',
      template: Template.amount,
      data: (item: ContractAsset) => ({
        data: item.value,
        options: {
          symbol: 'USD',
        },
      }),
    },
    {
      name: '',
      data: (item: ContractAsset) => ({
        data: item,
      }),
      template: Template.swapOrTransfer,
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
