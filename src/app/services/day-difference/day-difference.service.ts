import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class DayDifferenceService {
  constructor() {}

  calcateDayDifference(oldTimestamp: number): number {
    const currentTimestamp = new Date().getTime()
    const difference = currentTimestamp - oldTimestamp
    const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)

    return daysDifference
  }
}
