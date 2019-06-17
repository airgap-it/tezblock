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
  public async fetchHourlyMarketPrices(numberOfHours: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    const result = await cryptocompare.histoHour('XTZ', baseSymbol, {
      limit: numberOfHours - 1,
      timestamp: date
    })

    const newResult = result.map(price => {
      return {
        time: price.time,
        close: price.close,
        high: price.high,
        low: price.low,
        volumefrom: price.volumefrom,
        volumeto: price.volumeto
      }
    })

    return newResult
  }
}
