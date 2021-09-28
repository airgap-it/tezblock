import BigNumber from 'bignumber.js';

import {
  getCurrencyConverterPipeArgs,
  getTokenContractByAddress,
  isAsset,
  searchTokenContracts,
} from './contract';
import { OperationTypes } from '@tezblock/domain/operations';
import { Currency } from '@tezblock/domain/airgap';
import { TezosNetwork } from '@airgap/coinlib-core';

const tzBTCaddress = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';

describe('contract', () => {
  describe('getTokenContractByAddress', () => {
    it('when contract does not exist in given network then returns undefined', () => {
      expect(
        getTokenContractByAddress(tzBTCaddress, TezosNetwork.GRANADANET)
      ).toBe(undefined);
    });

    it('when contract exist in given network then returns that contract', () => {
      expect(
        getTokenContractByAddress(tzBTCaddress, TezosNetwork.MAINNET)
      ).toEqual(
        jasmine.objectContaining({
          id: tzBTCaddress,
        })
      );
    });
  });

  describe('searchTokenContracts', () => {
    it('when contract by part name does not exist in given network then returns empty array', () => {
      expect(searchTokenContracts('btc', TezosNetwork.GRANADANET)).toEqual([]);
    });

    it('when contract by part name exist in given network then returns array with option for that contract', () => {
      const response = searchTokenContracts('btc', TezosNetwork.MAINNET);

      expect(<any>response[0]).toEqual(
        jasmine.objectContaining({
          label: 'tzBTC',
          type: OperationTypes.TokenContract,
        })
      );
    });
  });

  describe('getCurrencyConverterPipeArgs', () => {
    it('when contract is nill return null', () => {
      expect(getCurrencyConverterPipeArgs(undefined, undefined)).toBe(null);
    });

    it('when contracts symbol is not convertable to USD then return null', () => {
      expect(getCurrencyConverterPipeArgs({ symbol: 'foo' }, undefined)).toBe(
        null
      );
    });

    it('when exchangeRates does not have data for BTC into USD then returns null', () => {
      expect(
        getCurrencyConverterPipeArgs(
          { symbol: 'BTC' },
          { [`${Currency.BTC}`]: { foo: 1 } }
        )
      ).toBe(null);
    });

    it('otherwise returns proper CurrencyConverterPipeArgs', () => {
      const exchangeRates = { [`${Currency.BTC}`]: { [`${Currency.USD}`]: 1 } };

      expect(
        getCurrencyConverterPipeArgs({ symbol: 'BTC' }, exchangeRates)
      ).toEqual({
        currInfo: {
          symbol: '$',
          currency: 'USD',
          price: new BigNumber(exchangeRates[Currency.BTC][Currency.USD]),
        },
        protocolIdentifier: 'btc',
      });
    });
  });

  describe('isAsset', () => {
    it('when transaction has truthy symbol property then returns true', () => {
      expect(isAsset(<any>{ symbol: 'foo' })).toBe(true);
    });

    it('when transaction does not have truthy symbol property then returns false', () => {
      expect(isAsset(<any>{ foo: 'foo' })).toBe(false);
    });
  });
});
