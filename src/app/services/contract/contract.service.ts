import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { forkJoin, Observable, pipe } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { get as _get } from 'lodash'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseService, Operation, Predicate, OrderBy } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { ContractOperation, TokenContract } from '@tezblock/domain/contract'
import { getFaProtocol } from '@tezblock/domain/airgap'

const transferPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters',
    operation: Operation.like,
    set: ['"transfer"'],
    inverse: false
  },
  {
    field: 'kind',
    operation: Operation.eq,
    set: ['transaction'],
    inverse: false
  },
  {
    field: 'destination',
    operation: Operation.eq,
    set: [contractHash],
    inverse: false
  }
]

const otherPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters',
    operation: Operation.like,
    set: ['"transfer"'],
    inverse: true
  },
  {
    field: 'parameters',
    operation: Operation.isnull,
    set: [''],
    inverse: true
  },
  {
    field: 'kind',
    operation: Operation.eq,
    set: ['transaction'],
    inverse: false
  },
  {
    field: 'destination',
    operation: Operation.eq,
    set: [contractHash],
    inverse: false
  }
]

export interface ContractOperationsCount {
  transferTotal: number
  otherTotal
}

@Injectable({
  providedIn: 'root'
})
export class ContractService extends BaseService {
  constructor(readonly chainNetworkService: ChainNetworkService, readonly httpClient: HttpClient) {
    super(chainNetworkService, httpClient)
  }

  loadManagerAddress(address: string): Observable<string> {
    return this.post<{ source: string }[]>('operations', {
      fields: ['source'],
      predicates: [
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['origination'],
          inverse: false
        },
        {
          field: 'originated_contracts',
          operation: Operation.eq,
          set: [address],
          inverse: false
        }
      ],
      orderBy: [
        {
          field: 'block_level',
          direction: 'desc'
        }
      ],
      limit: 1
    }).pipe(
      map(
        pipe(
          first,
          get(data => data.source)
        )
      )
    )
  }

  loadOperationsCount(contractHash: string): Observable<ContractOperationsCount> {
    return forkJoin(
      this.post<any[]>('operations', {
        fields: ['destination'],
        predicates: transferPredicates(contractHash),
        aggregation: [
          {
            field: 'destination',
            function: 'count'
          }
        ]
      }).pipe(
        map(
          pipe(
            first,
            get<any>(item => parseInt(item.count_destination))
          )
        )
      ),
      this.post<any[]>('operations', {
        fields: ['destination'],
        predicates: otherPredicates(contractHash),
        aggregation: [
          {
            field: 'destination',
            function: 'count'
          }
        ]
      }).pipe(
        map(
          pipe(
            first,
            get<any>(item => parseInt(item.count_destination))
          )
        )
      )
    ).pipe(map(([transferTotal, otherTotal]) => ({ transferTotal, otherTotal })))
  }

  loadOtherOperations(contract: TokenContract, orderBy: OrderBy, limit: number): Observable<ContractOperation[]> {
    const faProtocol = getFaProtocol(contract, this.chainNetworkService, this.environmentUrls)

    return this.post<ContractOperation[]>('operations', {
      predicates: otherPredicates(contract.id),
      orderBy: [orderBy],
      limit
    }).pipe(
      switchMap(contractOperations =>
        forkJoin(contractOperations.map(contractOperation => faProtocol.normalizeTransactionParameters(contractOperation.parameters))).pipe(
          map(response =>
            contractOperations.map((contractOperation, index) => ({
              ...contractOperation,
              entrypoint: _get(response[index], 'entrypoint')
            }))
          )
        )
      )
    )
  }
}
