import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'bignumber.js';

import { CurrencyInfo } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { getDecimalsForSymbol } from '@tezblock/domain/airgap/get-decimals-for-symbol';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';

export interface CurrencyConverterPipeArgs {
  currInfo: CurrencyInfo;
  protocolIdentifier: string;
}

@Pipe({
  name: 'currencyConverter',
  pure: true,
})
export class CurrencyConverterPipe implements PipeTransform {
  constructor(private readonly chainNetworkService: ChainNetworkService) {}

  public transform(
    value: string | number | BigNumber,
    args?: CurrencyConverterPipeArgs
  ): number {
    if (!BigNumber.isBigNumber(value)) {
      value = new BigNumber(value);
    }

    if (!args) {
      return null;
    }

    const decimals = getDecimalsForSymbol(
      args.protocolIdentifier,
      this.chainNetworkService.getNetwork()
    );

    const BN = BigNumber.clone({
      FORMAT: {
        decimalSeparator: `.`,
        groupSeparator: `'`,
        groupSize: 3,
      },
    });
    const amount = new BN(value).shiftedBy(decimals * -1);

    return this.transformToCurrency(amount, args.currInfo);
    /*
    args ? result = this.transformToCurrency(amount, args.currInfo) : result = value.toNumber() */
  }
  public transformToCurrency(val: BigNumber, currency: CurrencyInfo): number {
    return val.multipliedBy(currency.price).toNumber();
  }
}
