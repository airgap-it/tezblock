import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import { ApiService } from '../api/api.service'
import { distinctPagination, Facade, Pagination } from '../facade/facade'

interface RightsSingleServiceState {
  rights: any
  kind: string
  address: string | undefined

  pagination: Pagination
  loading: boolean
}

export interface VotingInfo {
  pkh: string
  rolls: number
}

const initialState: RightsSingleServiceState = {
  rights: [],
  kind: '',
  address: '',
  pagination: {
    currentPage: 1,
    selectedSize: 10,
    pageSizes: [5, 10, 20, 50]
  },
  loading: true
}

@Injectable({
  providedIn: 'root'
})
export class RightsSingleService extends Facade<RightsSingleServiceState> {
  public rights$ = this.state$.pipe(
    map(state => state.rights),
    distinctUntilChanged()
  )
  public kind$ = this.state$.pipe(
    map(state => state.kind),
    distinctUntilChanged()
  )
  public address$ = this.state$.pipe(
    map(state => state.address),
    distinctUntilChanged()
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(private readonly apiService: ApiService) {
    super(initialState)

    combineLatest([this.pagination$, this.kind$, this.address$])
      .pipe(
        switchMap(([pagination, kind, address]) => {
          if (kind === 'baking_rights') {
            return this.apiService.getBakingRights(address, pagination.selectedSize * pagination.currentPage)
          } else if (kind === 'endorsing_rights') {
            return this.apiService.getEndorsingRights(address, pagination.selectedSize * pagination.currentPage)
          } else {
            return new Observable<Object[]>(observer => {
              observer.next([])
              observer.complete()
            })
          }
        })
      )
      .subscribe(rights => {
        this.updateState({ ...this._state, rights, loading: false })
      })
  }

  public updateKind(kind: string) {
    this.updateState({ ...this._state, kind, loading: true })
  }

  public updateAddress(address: string) {
    this.updateState({ ...this._state, address, loading: true })
  }
  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }
    this.updateState({ ...this._state, pagination, loading: true })
  }
}
