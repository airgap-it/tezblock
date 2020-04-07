import { Injectable } from '@angular/core'
import { from, forkJoin, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { Block } from '../../interfaces/Block'
import { ApiService } from '../api/api.service'
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

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  constructor(private readonly apiService: ApiService) {}

  getById(level: string, fields?: string[]): Observable<Block> {
    return this.apiService.getBlockById(level).pipe(
      switchMap(blocks => this.getAdditionalBlockData(blocks, fields)),
      map(first)
    )
  }

  getLatest(fields?: string[]): Observable<Block> {
    return this.apiService.getLatestBlocks(1).pipe(
      switchMap((blocks: Block[]) => this.getAdditionalBlockData(blocks, fields)),
      map(first)
    )
  }

  getLatestBlocks(limit: number, fields?: string[]): Observable<Block[]> {
    return this.apiService.getLatestBlocks(limit).pipe(
      switchMap((blocks: Block[]) => this.getAdditionalBlockData(blocks, fields))
    )
  }

  private getAdditionalBlockData(blocks: Block[], fields?: string[]): Observable<Block[]> {
    if (!blocks || blocks.length === 0) {
      return of([])
    }

    const blockRange = blocks.map(blocksList => blocksList.level)
    const isField = (fieldName: string): boolean => fields && fields.some(field => field === fieldName)
    const getAmounts = isField('volume')
      ? this.getAdditionalBlockField<ConseilAmountSum>(blockRange, 'amount', 'sum')
      : of<ConseilAmountSum[]>([])
    const getFees = isField('fee') ? this.getAdditionalBlockField<ConseilFeeSum>(blockRange, 'fee', 'sum') : of<ConseilFeeSum[]>([])
    const getCounts = isField('txcount')
      ? this.getAdditionalBlockField<ConseilCount>(blockRange, 'operation_group_hash', 'count')
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

  private getAdditionalBlockField<T>(blockRange: number[], field: string, operation: string): Observable<T[]> {
    return from(this.apiService.getAdditionalBlockField<T>(blockRange, field, operation))
  }
}
