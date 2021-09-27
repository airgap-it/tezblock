import { MarketDataSample } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { Injectable } from '@angular/core';

const cryptocompare = require('cryptocompare');

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  fetchHourlyMarketPrices(
    numberOfHours: number,
    date: Date,
    baseSymbol = 'USD'
  ): Promise<MarketDataSample[]> {
    return cryptocompare.histoHour('XTZ', baseSymbol, {
      limit: numberOfHours - 1,
      timestamp: date,
    });
  }
}
