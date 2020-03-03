import { Injectable } from '@angular/core'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import { ApiService } from '../api/api.service'
import { BlockService } from '../blocks/blocks.service'
import { distinctPagination, Facade, Pagination } from '../facade/facade'

export const meanBlockTime = 60.032 // seconds, not as per https://medium.com/cryptium/tempus-fugit-understanding-cycles-snapshots-locking-and-unlocking-periods-in-the-tezos-protocol-78b27bd6d62d
export const numberOfBlocksToSeconds = (numberOfBlocks: number): number => meanBlockTime * numberOfBlocks

interface CycleServiceState {
  currentCycle: number
  currentBlockLevel: number
  cycleStartingBlockLevel: number
  cycleEndingBlockLevel: number
  cycleProgress: number
  remainingTime: string
  pagination: Pagination
  loading: boolean
}

const initialState: CycleServiceState = {
  currentCycle: 0,
  currentBlockLevel: 0,
  cycleStartingBlockLevel: 0,
  cycleEndingBlockLevel: 0,
  cycleProgress: 0,
  remainingTime: '',
  pagination: {
    currentPage: 0,
    selectedSize: 6,
    pageSizes: [5, 10, 20, 50]
  },
  loading: false
}

@Injectable({
  providedIn: 'root'
})
export class CycleService extends Facade<CycleServiceState> {
  public remainingTime$ = this.state$.pipe(
    map(state => state.remainingTime),
    distinctUntilChanged()
  )
  public currentCycle$ = this.state$.pipe(
    map(state => state.currentCycle),
    distinctUntilChanged()
  )
  public cycleProgress$ = this.state$.pipe(
    map(state => state.cycleProgress),
    distinctUntilChanged()
  )
  public cycleStartingBlockLevel$ = this.state$.pipe(
    map(state => state.cycleStartingBlockLevel),
    distinctUntilChanged()
  )
  public cycleEndingBlockLevel$ = this.state$.pipe(
    map(state => state.cycleEndingBlockLevel),
    distinctUntilChanged()
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(
    map(state => state.loading),
    distinctUntilChanged()
  )

  constructor(private readonly apiService: ApiService, private readonly blockService: BlockService) {
    super(initialState)

    combineLatest([this.pagination$, this.blockService.list$])
      .pipe(
        distinctUntilChanged(),
        filter(([_pagination, blocks]) => blocks.length > 0),
        tap(([_pagination, blocks]) => {
          this.updateState({ ...this._state, currentCycle: blocks[0].meta_cycle, currentBlockLevel: blocks[0].level, loading: false })
        }),
        switchMap(([_pagination, blocks]) => {
          return this.apiService.getCurrentCycleRange(blocks[0].meta_cycle)
        })
      )
      .subscribe(blocks => {
        const cycleInfo = blocks[0]
        const cycleStartingBlockLevel = cycleInfo.level
        const cycleEndingBlockLevel = cycleInfo.level + 4095
        const cycleProgress = Math.round(((this._state.currentBlockLevel - cycleStartingBlockLevel) / 4096) * 100)

        const remainingBlocks = cycleEndingBlockLevel - this._state.currentBlockLevel
        let totalSeconds = numberOfBlocksToSeconds(remainingBlocks)
        let hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        const minutes = Math.floor(totalSeconds / 60)

        const days = Math.floor(hours / 24)

        hours %= 24

        this.updateState({
          ...this._state,
          cycleStartingBlockLevel,
          cycleEndingBlockLevel,
          cycleProgress,
          remainingTime: days >= 1 ? `~${days}d ${hours}h ${minutes}m` : `~${hours}h ${minutes}m`,
          loading: false
        })
      })
  }
}
