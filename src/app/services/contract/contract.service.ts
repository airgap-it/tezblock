import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { forkJoin, from, Observable, pipe, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { get as _get } from 'lodash'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseService, Operation, Predicate, OrderBy, ENVIRONMENT_URL } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { ContractOperation, fillTransferOperations, TokenContract, TokenHolder } from '@tezblock/domain/contract'
import { getFaProtocol, getTezosFAProtocolOptions } from '@tezblock/domain/airgap'
import moment from 'moment'
import { WetziKoin } from '@tezblock/domain/airgap/wetzikoin'
import { TezosBTC, TezosFA1Protocol, TezosStaker, TezosUSD, TezosWrapped } from '@airgap/coinlib-core'
import { TezosETHtz } from '@airgap/coinlib-core/protocols/tezos/fa/TezosETHtz'

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

  if (contract.symbol === 'STKR') {
    return new TezosStaker(options)
  }

  if (contract.symbol === 'tzBTC') {
    return new TezosBTC(options)
  }

  if (contract.symbol === 'USDtz') {
    return new TezosUSD(options)
  }

  if (contract.symbol === 'weCHF') {
    return new WetziKoin(options)
  }

  if (contract.symbol === 'ETHtz') {
    return new TezosETHtz(options)
  }

  if (contract.symbol === 'wXTZ') {
    return new TezosWrapped(options)
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

  public loadManagerAddress(address: string): Observable<string> {
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

  public loadOperationsCount(contractHash: string): Observable<ContractOperationsCount> {
    return forkJoin([
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
    ]).pipe(map(([transferTotal, otherTotal]) => ({ transferTotal, otherTotal })))
  }

  public loadOtherOperations(contract: TokenContract, orderBy: OrderBy, limit: number): Observable<ContractOperation[]> {
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
                faProtocol.normalizeTransactionParameters(contractOperation.parameters_micheline)
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

  public loadTransferOperations(contract: TokenContract, orderBy: OrderBy, limit: number): Observable<ContractOperation[]> {
    return this.post<ContractOperation[]>('operations', {
      predicates: transferPredicates(contract.id),
      orderBy: [orderBy],
      limit
    }).pipe(
      switchMap(
        contractOperations =>
          <Observable<ContractOperation[]>>from(fillTransferOperations(contractOperations, this.chainNetworkService, () => undefined, contract))
      )
    )
  }

  public load24hTransferOperations(contract: TokenContract): Observable<ContractOperation[]> {
    const cutoff = moment().subtract(24, 'hours')

    return this.post<ContractOperation[]>('operations', {
      fields: ['timestamp', 'parameters_entrypoints', 'parameters_micheline', 'parameters', 'kind'],
      predicates: [
        {
          field: 'parameters_entrypoints',
          operation: Operation.eq,
          set: [
            'transfer'
          ],
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
          set: [
            'transaction'
          ],
          inverse: false
        },
        {
          field: 'destination',
          operation: Operation.eq,
          set: [
            contract.id
          ],
          inverse: false
        },
        {
          field: 'status',
          operation: Operation.eq,
          set: ['applied'],
          inverse: false
        },
        {
          field: 'timestamp',
          operation: Operation.gt,
          set: [
            cutoff.toDate().getTime()
          ],
          inverse: false
        }
      ]
    }).pipe(
      switchMap(
        contractOperations =>
          <Observable<ContractOperation[]>>from(fillTransferOperations(contractOperations, this.chainNetworkService, () => undefined, contract))
      )
    )
  }

  public loadTokenHolders(contract: TokenContract): Observable<TokenHolder[]> {
    return from(getContractProtocol(contract, this.chainNetworkService).fetchTokenHolders())
  }

  public getTotalSupplyByContract(contract: TokenContract): Observable<string> {
    const protocol = getFaProtocol(contract, this.chainNetworkService.getEnvironment(), this.chainNetworkService.getNetwork())
    if (protocol instanceof TezosFA1Protocol) {
      return from(protocol.getTotalSupply())
    }

    return from(new Promise<string>((resolve) => {
      resolve(contract.totalSupply)
    }))
  }

  public loadEntrypoints(id: string): Observable<string[]> {
    return this.get(`${ENVIRONMENT_URL.rpcUrl}/chains/main/blocks/head/context/contracts/${id}/entrypoints`, true).pipe(
      map((response: any) => {
        return Object.keys(response.entrypoints)
      })
    )
  }
}
