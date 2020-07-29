import { Injectable } from '@angular/core'
const cryptocompare = require('cryptocompare')

export interface MarketDataSample {
  time: number
  close: number
  high: number
  low: number
  open: number
  volumefrom: string
  volumeto: number
}

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
