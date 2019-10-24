import { OnDestroy } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'
import { Observable, ReplaySubject, Subscription, timer } from 'rxjs'
import { Account } from 'src/app/interfaces/Account'

export interface Pagination {
  selectedSize: number
  currentPage: number
  pageSizes: number[]
}

export class Facade<T> implements OnDestroy {
  protected _state: T
  private readonly store: ReplaySubject<T> = new ReplaySubject<T>(1)
  protected readonly state$: Observable<T> = this.store.asObservable()

  protected timer$ = timer(0, 30000)

  protected subscription: Subscription = new Subscription()

  public ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  constructor(state: T) {
    this.store.next((this._state = state))
  }

  protected updateState(state: T) {
    this.store.next((this._state = state))
  }
}

export function distinctTransactionArray(previous, current): boolean {
  if (previous.length !== current.length) {
    return false
  }
  for (let i = 0; i < previous.length; i++) {
    if (previous[i].operation_group_hash !== current[i].operation_group_hash) {
      return false
    }
  }

  return true
}

export function distinctPagination(previous: Pagination, current: Pagination): boolean {
  return !(
    previous.currentPage !== current.currentPage ||
    previous.pageSizes !== current.pageSizes ||
    previous.selectedSize !== current.selectedSize
  )
}

export function disctinctChartData(previous: MarketDataSample[], current: MarketDataSample[]): boolean {
  const previousData = [{ data: [] }]
  const currentData = [{ data: [] }]

  previousData[0].data = previous.map(data => data.open)
  currentData[0].data = current.map(data => data.open)

  return !(previousData[0].data.slice(-1).pop() !== currentData[0].data.slice(-1).pop())
}

export function distinctAccounts(previous: Account[], current: Account[]): boolean {
  return !(previous.length !== current.length)
}
