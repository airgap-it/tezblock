import { TranslateService } from '@ngx-translate/core';
import {
  Column,
  Template,
} from '@tezblock/components/tezblock-table/tezblock-table.component';
import { isCurated } from '@tezblock/domain/account';
import { sanitizeThumbnailUri } from '@tezblock/domain/contract';
import { TokenAsset } from '@tezblock/services/contract/contract.service';

export const columns = (translate: TranslateService): Column[] => [
  {
    name: translate.instant('token-contract-overview.asset'),
    field: 'asset',
    template: Template.address,
    data: (item: TokenAsset) => ({
      data: item.contract.address,
      options: {
        showFullAddress: !isCurated(item.contract.address),
        forceIdenticon: false,
        useValue: isCurated(item.contract.address)
          ? undefined
          : item?.metadata?.name,
        useImgUrl: sanitizeThumbnailUri(item),
        isContract: true,
      },
    }),
  },

  {
    name: translate.instant('token-contract-overview.supply'),
    field: 'amount',
    template: Template.amount,
    data: (item: TokenAsset) => {
      return {
        data: item?.totalSupply,
        options: {
          symbol: item?.metadata?.symbol ?? 'NONE',
          decimals: item?.metadata?.decimals,
        },
      };
    },
  },
  {
    name: translate.instant('token-contract-overview.transfers'),
    field: 'transfersCount',
  },
];
