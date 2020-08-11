import { Injectable } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'

const cryptocompare = require('cryptocompare')

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  fetchHourlyMarketPrices(numberOfHours: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    return cryptocompare.histoHour('XTZ', baseSymbol, {
      limit: numberOfHours - 1,
      timestamp: date
    })
  }
}
