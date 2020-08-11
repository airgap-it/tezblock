import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { forkJoin, from, Observable, pipe, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { get as _get } from 'lodash'
import { TezosStaker, TezosBTC, TezosUSD, IAirGapTransaction } from 'airgap-coin-lib'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseService, Operation, Predicate, OrderBy, ENVIRONMENT_URL } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { ContractOperation, fillTransferOperations, TokenContract, TokenHolder } from '@tezblock/domain/contract'
import { getFaProtocol, getTezosFAProtocolOptions } from '@tezblock/domain/airgap'

const transferPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters_entrypoints',
    operation: Operation.eq,
    set: ['transfer'],
    inverse: false
  },
  {
    field: 'parameters',
    operation: Operation.isnull,
    set: [],
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

const otherPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters_entrypoints',
    operation: Operation.eq,
    set: ['transfer'],
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

export interface ContractProtocol {
  fetchTokenHolders(): Promise<TokenHolder[]>
}

export const getContractProtocol = (contract: TokenContract, chainNetworkService: ChainNetworkService): ContractProtocol => {
  const environmentUrls = chainNetworkService.getEnvironment()
  const tezosNetwork = chainNetworkService.getNetwork()
  const options = getTezosFAProtocolOptions(contract, environmentUrls, tezosNetwork)

  // Why airgap implements api interfaces in such a inconsistent way - compare to new TezosFAProtocol where arguments it's an object
  if (contract.symbol === 'STKR') {
    return new TezosStaker(options)
  }

  if (contract.symbol === 'tzBTC') {
    return new TezosBTC(options)
  }

  if (contract.symbol === 'USDtz') {
    return new TezosUSD(options)
  }

  return undefined
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
    const faProtocol = getFaProtocol(contract, this.chainNetworkService.getEnvironment(), this.chainNetworkService.getNetwork())

    return this.post<ContractOperation[]>('operations', {
      predicates: otherPredicates(contract.id),
      orderBy: [orderBy],
      limit
    }).pipe(
      switchMap(contractOperations =>
        contractOperations.length > 0
          ? forkJoin(
              contractOperations.map(contractOperation =>
                from(
                  faProtocol.normalizeTransactionParameters(contractOperation.parameters_micheline ?? contractOperation.parameters)
                ).pipe(catchError(() => of({ entrypoint: 'default', value: null })))
              )
            ).pipe(
              map(response =>
                contractOperations.map((contractOperation, index) => ({
                  ...contractOperation,
                  entrypoint:
                    contractOperation.parameters_entrypoints === 'default'
                      ? _get(response[index], 'entrypoint')
                      : contractOperation.parameters_entrypoints,
                  symbol: contract.symbol,
                  decimals: contract.decimals
                }))
              )
            )
          : of([])
      )
    )
  }

  loadTransferOperations(contract: TokenContract, orderBy: OrderBy, limit: number): Observable<ContractOperation[]> {
    return this.post<ContractOperation[]>('operations', {
      predicates: transferPredicates(contract.id),
      orderBy: [orderBy],
      limit
    }).pipe(
      switchMap(
        contractOperations =>
          <Observable<ContractOperation[]>>fillTransferOperations(contractOperations, this.chainNetworkService, () => undefined, contract)
      )
    )
  }

  loadTokenHolders(contract: TokenContract): Observable<TokenHolder[]> {
    return from(getContractProtocol(contract, this.chainNetworkService).fetchTokenHolders())
  }

  getTotalSupplyByContract(contract: TokenContract): Observable<string> {
    const protocol = getFaProtocol(contract, this.chainNetworkService.getEnvironment(), this.chainNetworkService.getNetwork())

    return from(protocol.getTotalSupply())
  }

  loadEntrypoints(id: string): Observable<string[]> {
    return this.get(`${ENVIRONMENT_URL.rpcUrl}/chains/main/blocks/head/context/contracts/${id}/entrypoints`, true).pipe(
      map((response: any) => {
        return Object.keys(response.entrypoints)
      })
    )
  }
}
