import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import { Block } from 'src/app/interfaces/Block'

import { BlockService } from './../blocks/blocks.service'
import { distinctPagination, Facade, Pagination } from './../facade/facade'

interface BlockSingleServiceState {
  block: Block[] | undefined
  id: string | undefined
  hash: string | undefined

  pagination: Pagination
  loading: boolean
}

const initialState: BlockSingleServiceState = {
  block: [],
  id: undefined,
  hash: undefined,
  pagination: {
    currentPage: 0,
    selectedSize: 6,
    pageSizes: [5, 10, 20, 50]
  },
  loading: true
}

@Injectable({
  providedIn: 'root'
})
export class BlockSingleService extends Facade<BlockSingleServiceState> {
  public block$ = this.state$.pipe(
    map(state => state.block),
    distinctUntilChanged()
  )

  public id$ = this.state$.pipe(
    map(state => state.id),
    distinctUntilChanged()
  )

  public hash$ = this.state$.pipe(
    map(state => state.hash),
    distinctUntilChanged()
  )

  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(private readonly blockService: BlockService) {
    super(initialState)

    this.subscription = combineLatest([this.pagination$, this.id$, this.hash$, this.timer$])
      .pipe(
        switchMap(([pagination, id, hash, _]) => {
          if (id) {
            return this.blockService.getById(id)
          } else if (hash) {
            return this.blockService.getByHash(hash)
          } else {
            return new Observable<Block[]>(observer => {
              observer.next(undefined)

              observer.complete()
            })
          }
        })
      )
      .subscribe(block => {
        this.updateState({ ...this._state, block, loading: false })
      })
  }

  public updateId(id: string) {
    this.updateState({ ...this._state, id, hash: undefined, loading: true })
  }

  public updateHash(hash: string) {
    this.updateState({ ...this._state, hash, id: undefined, loading: true })
  }
}
