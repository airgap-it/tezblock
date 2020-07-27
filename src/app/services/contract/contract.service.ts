import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { forkJoin, from, Observable, pipe, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { get as _get } from 'lodash'
import { TezosStaker, TezosBTC, TezosUSD } from 'airgap-coin-lib'
import { TezosContractIntrospector } from 'conseiljs'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseService, Operation, Predicate, OrderBy } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { ContractOperation, TokenContract, TokenHolder } from '@tezblock/domain/contract'
import { getFaProtocol } from '@tezblock/domain/airgap'
import { getAccountByIdBody } from '@tezblock/domain/account'
import { Account } from '@tezblock/interfaces/Account'

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

  // Why airgap implements api interfaces in such a inconsistent way - compare to new TezosFAProtocol where arguments it's an object
  if (contract.symbol === 'STKR') {
    return new TezosStaker(
      contract.id,
      environmentUrls.rpcUrl,
      environmentUrls.conseilUrl,
      environmentUrls.conseilApiKey,
      chainNetworkService.getEnvironmentVariable(),
      chainNetworkService.getNetwork()
    )
  }

  if (contract.symbol === 'tzBTC') {
    return new TezosBTC(
      contract.id,
      environmentUrls.rpcUrl,
      environmentUrls.conseilUrl,
      environmentUrls.conseilApiKey,
      chainNetworkService.getEnvironmentVariable(),
      chainNetworkService.getNetwork()
    )
  }

  if (contract.symbol === 'USDtz') {
    return new TezosUSD(
      contract.id,
      environmentUrls.rpcUrl,
      environmentUrls.conseilUrl,
      environmentUrls.conseilApiKey,
      chainNetworkService.getEnvironmentVariable(),
      chainNetworkService.getNetwork()
    )
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
    const faProtocol = getFaProtocol(contract, this.chainNetworkService)

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
    const faProtocol = getFaProtocol(contract, this.chainNetworkService)

    return this.post<ContractOperation[]>('operations', {
      predicates: transferPredicates(contract.id),
      orderBy: [orderBy],
      limit
    }).pipe(
      switchMap(contractOperations =>
        contractOperations.length > 0
          ? forkJoin(
              contractOperations.map(contractOperation =>
                faProtocol.normalizeTransactionParameters(contractOperation.parameters_micheline ?? contractOperation.parameters)
              )
            ).pipe(
              map(response =>
                contractOperations
                  .map((contractOperation, index) => {
                    try {
                      const details = faProtocol.transferDetailsFromParameters({
                        entrypoint: contractOperation.parameters_entrypoints,
                        value: response[index].value
                      })
                      return {
                        ...contractOperation,
                        from: details.from,
                        to: details.to,
                        amount: details.amount,
                        symbol: contract.symbol,
                        decimals: contract.decimals
                      }
                    } catch {
                      // an error can happen if Conseil does not return valid values for parameters_micheline, like it is happening now for operation with hash opKYnbone62mtx6tNhkbPRbawmHzXZXwuAmHoSZKtGjhtUjpSaM,
                      // in this case we return undefined because we cannot list it as a transfer operation since we cannot get out the details
                      return undefined
                    }
                  })
                  .filter(tx => tx !== undefined)
              )
            )
          : of([])
      )
    )
  }

  loadTokenHolders(contract: TokenContract): Observable<TokenHolder[]> {
    return from(getContractProtocol(contract, this.chainNetworkService).fetchTokenHolders())
  }

  getTotalSupplyByContract(contract: TokenContract): Observable<string> {
    const protocol = getFaProtocol(contract, this.chainNetworkService)

    return from(protocol.getTotalSupply())
  }

  loadEntrypoints(id: string) {
    return this.post<Account[]>('accounts', getAccountByIdBody(id)).pipe(
      map(first),
      map(account => {
        const foo = TezosContractIntrospector.generateEntryPointsFromParams(account.script)
        
        return []
      })
    )
  }
}

/*

setLogLevel('debug');
const tezosNode = '';
async function interrogateContract() {
    const contractParameters = `parameter (or (or (or (pair %transfer (address :from) (pair (address :to) (nat :value))) (or (pair %transferViaProxy (address :sender) (pair (address :from) (pair (address :to) (nat :value)))) (pair %approve (address :spender) (nat :value)))) (or (pair %approveViaProxy (address :sender) (pair (address :spender) (nat :value))) (or (pair %getAllowance (pair (address :owner) (address :spender)) (contract nat)) (pair %getBalance (address :owner) (contract nat))))) (or (or (pair %getTotalSupply unit (contract nat)) (or (bool %setPause) (address %setAdministrator))) (or (or (pair %getAdministrator unit (contract address)) (pair %mint (address :to) (nat :value))) (or (pair %burn (address :from) (nat :value)) (address %setProxy)))));`;
    const entryPoints = await TezosContractIntrospector.generateEntryPointsFromParams(contractParameters);
    entryPoints.forEach(p => {
        console.log(`${p.name}(${p.parameters.map(pp => (pp.name || 'unnamed') + '/' + pp.type).join(', ')})`);
    });
    console.log(entryPoints[0].generateParameter('', '', 999));
}
interrogateContract();
*/
