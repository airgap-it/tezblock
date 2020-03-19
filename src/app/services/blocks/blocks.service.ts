import { Injectable } from '@angular/core'
import { combineLatest, from, forkJoin, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { Block } from '../../interfaces/Block'
import { ApiService } from '../api/api.service'
import { Facade, Pagination } from '../facade/facade'
import { first } from '@tezblock/services/fp'

interface ConseilCount {
  block_level: number
  count_operation_group_hash: string
}

interface ConseilAmountSum {
  block_level: number
  sum_amount: number
}

interface ConseilFeeSum {
  block_level: number
  sum_fee: number
}

interface BlockServiceState {
  blocks: Block[]
  pagination: Pagination
  loading: boolean
}

const initialState: BlockServiceState = {
  blocks: [],
  pagination: {
    currentPage: 1,
    selectedSize: 6,
    pageSizes: [5, 10, 20, 50]
  },
  loading: true
}

@Injectable({
  providedIn: 'root'
})
export class BlockService extends Facade<BlockServiceState> {
  public list$ = this.state$.pipe(
    map(state => state.blocks),
    distinctUntilChanged()
  )
  public latestBlock$ = this.state$.pipe(
    map(state => (state.blocks.length > 0 ? state.blocks[0] : undefined)),
    distinctUntilChanged()
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged()
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(private readonly apiService: ApiService) {
    super(initialState)

    combineLatest([this.pagination$, this.timer$])
      .pipe(
        switchMap(([pagination, _]) => {
          return this.getLatest(pagination.selectedSize * pagination.currentPage)
        }),
        switchMap(blocks => {
          if (this._state.blocks.length === 0) {
            this.updateState({ ...this._state, blocks, loading: false })
          }

          return this.getAdditionalBlockData(blocks, this._state.pagination.selectedSize * this._state.pagination.currentPage)
        })
      )
      .subscribe(blocks => {
        this.updateState({ ...this._state, blocks, loading: false })
      })
  }

  public getLatest(limit: number): Observable<Block[]> {
    return this.apiService.getLatestBlocks(limit)
  }

  public async getAdditionalBlockData(blocks: Block[], limit: number): Promise<Block[]> {
    const blockRange = blocks.map(blocksList => blocksList.level)
    const amountPromise = this.getAdditionalBlockField<ConseilAmountSum>(blockRange, 'amount', 'sum', limit)
    const feePromise = this.getAdditionalBlockField<ConseilFeeSum>(blockRange, 'fee', 'sum', limit)
    const operationGroupPromise = this.getAdditionalBlockField<ConseilCount>(blockRange, 'operation_group_hash', 'count', limit)

    return new Promise((resolve, reject) => {
      Promise.all([amountPromise, feePromise, operationGroupPromise])
        .then(([amounts, fees, operations]: [ConseilAmountSum[], ConseilFeeSum[], ConseilCount[]]) => {
          blocks.forEach(block => {
            const blockAmount = amounts.find((amount: ConseilAmountSum) => amount.block_level === block.level)
            const blockFee = fees.find((fee: ConseilFeeSum) => fee.block_level === block.level)
            const blockOperations = operations.find((operation: ConseilCount) => operation.block_level === block.level)
            block.volume = blockAmount ? blockAmount.sum_amount : 0
            block.fee = blockFee ? blockFee.sum_fee : 0
            block.txcount = blockOperations ? blockOperations.count_operation_group_hash : '0'
          })

          resolve(blocks)
        })
        .catch(reject)
    })
  }

  public getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string, limit: number): Promise<T[]> {
    return this.apiService.getAdditionalBlockField(blockRange, field, operation, limit)
  }

  public getById(level: string): Observable<Block[]> {
    return this.apiService.getBlockById(level).pipe(switchMap(blocks => this.getAdditionalBlockData(blocks, 1)))
  }

  public getByHash(hash: string): Observable<Block[]> {
    return this.apiService.getBlockByHash(hash)
  }

  public getEndorsedSlotsCount(blockHash: string): Observable<number> {
    return this.apiService.getEndorsedSlotsCount(blockHash)
  }

  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }

    this.updateState({ ...this._state, pagination, loading: true })
  }

  public setPageSize(selectedSize: number) {
    const pagination = { ...this._state.pagination, selectedSize }
    this.updateState({ ...this._state, pagination, loading: true })
  }
}

// TODO: remove promises
@Injectable({
  providedIn: 'root'
})
export class NewBlockService {
  constructor(private readonly apiService: ApiService) {}

  getById(level: string, fields?: string[]): Observable<Block> {
    return this.apiService.getBlockById(level).pipe(
      switchMap(blocks => this.getAdditionalBlockData(blocks, 1, fields)),
      map(first)
    )
  }

  getLatest(fields?: string[]): Observable<Block> {
    return this.apiService.getLatestBlocks(1).pipe(
      switchMap((blocks: Block[]) => this.getAdditionalBlockData(blocks, 1, fields)),
      map(first)
    )
  }

  getLatestBlocks(limit: number, fields?: string[]): Observable<Block[]> {
    return this.apiService.getLatestBlocks(limit).pipe(
      switchMap((blocks: Block[]) => this.getAdditionalBlockData(blocks, 1, fields))
    )
  }

  private getAdditionalBlockData(blocks: Block[], limit: number, fields?: string[]): Observable<Block[]> {
    const blockRange = blocks.map(blocksList => blocksList.level)
    const isField = (fieldName: string): boolean => fields && fields.some(field => field === fieldName)
    const getAmounts = isField('volume')
      ? this.getAdditionalBlockField<ConseilAmountSum>(blockRange, 'amount', 'sum', limit)
      : of<ConseilAmountSum[]>([])
    const getFees = isField('fee') ? this.getAdditionalBlockField<ConseilFeeSum>(blockRange, 'fee', 'sum', limit) : of<ConseilFeeSum[]>([])
    const getCounts = isField('txcount')
      ? this.getAdditionalBlockField<ConseilCount>(blockRange, 'operation_group_hash', 'count', limit)
      : of<ConseilCount[]>([])

    return forkJoin([getAmounts, getFees, getCounts]).pipe(
      map(([amounts, fees, counts]) =>
        blocks.map(block => {
          const blockAmount = amounts.find((amount: ConseilAmountSum) => amount.block_level === block.level)
          const blockFee = fees.find((fee: ConseilFeeSum) => fee.block_level === block.level)
          const blockOperations = counts.find((operation: ConseilCount) => operation.block_level === block.level)

          return {
            ...block,
            volume: blockAmount ? blockAmount.sum_amount : 0,
            fee: blockFee ? blockFee.sum_fee : 0,
            txcount: blockOperations ? blockOperations.count_operation_group_hash : '0'
          }
        })
      )
    )
  }

  private getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string, limit: number): Observable<T[]> {
    return from(this.apiService.getAdditionalBlockField<T>(blockRange, field, operation, limit))
  }
}
