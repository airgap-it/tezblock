import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, from, Observable, pipe, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { get as _get } from 'lodash';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import {
  BaseService,
  Operation,
  Predicate,
  OrderBy,
  ENVIRONMENT_URL,
} from '@tezblock/services/base.service';
import { first, get } from '@tezblock/services/fp';
import {
  ContractOperation,
  fillTransferOperations,
  RawContractAsset,
  TokenContract,
  TokenHolder,
  Metadata,
  sanitizeThumbnailUri,
  ContractAddress,
} from '@tezblock/domain/contract';
import {
  getFaProtocol,
  getTezosFA2ProtocolOptions,
  getTezosFAProtocolOptions,
} from '@tezblock/domain/airgap';
import moment from 'moment';
import {
  TezosBTC,
  TezosFA1p2Protocol,
  TezosFA1Protocol,
  TezosFA2Protocol,
  TezosStaker,
  TezosUSD,
  TezosWrapped,
} from '@airgap/coinlib-core';
import { TezosETHtz } from '@airgap/coinlib-core/protocols/tezos/fa/TezosETHtz';
import { TezosKolibriUSD } from '@airgap/coinlib-core/protocols/tezos/fa/TezosKolibriUSD';
import { ContractAsset } from '@tezblock/domain/contract';
import BigNumber from 'bignumber.js';
import { TezosToolkit, TransferParams } from '@taquito/taquito';
import { Account, isCurated } from '@tezblock/domain/account';
import { EnvironmentUrls } from '@tezblock/domain/generic/environment-urls';

const transferPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters_entrypoints',
    operation: Operation.eq,
    set: ['transfer'],
    inverse: false,
  },
  {
    field: 'parameters',
    operation: Operation.isnull,
    set: [],
    inverse: true,
  },
  {
    field: 'kind',
    operation: Operation.eq,
    set: ['transaction'],
    inverse: false,
  },
  {
    field: 'destination',
    operation: Operation.eq,
    set: [contractHash],
    inverse: false,
  },
];

const otherPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters_entrypoints',
    operation: Operation.eq,
    set: ['transfer'],
    inverse: true,
  },
  {
    field: 'parameters',
    operation: Operation.isnull,
    set: [''],
    inverse: true,
  },
  {
    field: 'kind',
    operation: Operation.eq,
    set: ['transaction'],
    inverse: false,
  },
  {
    field: 'destination',
    operation: Operation.eq,
    set: [contractHash],
    inverse: false,
  },
];

export interface TZKtAccount {
  address: string;
}

export interface TZKtContract {
  alias: string;
  address: string;
}

export interface TZKtTransaction {
  type: string;
  id: number;
  level: number;
  timestamp: Date;
  block: string;
  hash: string;
  counter: number;
  sender: {
    address: string;
  };
  gasLimit: number;
  gasUsed: number;
  storageLimit: number;
  storageUsed: number;
  bakerFee: number;
  storageFee: number;
  allocationFee: number;
  target: {
    alias: string;
    address: string;
  };
  amount: number;
  parameter: {
    entrypoint: string;
    value: {
      to: string;
      value: string;
    };
  };
  status: string;
  hasInternals: boolean;
}

export interface TokenAsset {
  id: number;
  contract: TZKtContract;
  tokenId: string;
  standard: string;
  metadata: Metadata;
  totalSupply: number;
}

export interface TZKtTokenBalance {
  id: number;
  account: TZKtAccount;
  token: TokenAsset;
  balance: string;
  transfersCount: number;
  firstLevel: number;
  firstTime: Date;
  lastLevel: number;
  lastTime: Date;
}

export interface To {
  address: string;
}

export interface TZKtTokenTransfer {
  id: number;
  level: number;
  timestamp: Date;
  token: TokenAsset;
  to: To;
  amount: string;
  transactionId: number;
}

export interface TokenBalanceByAddress {
  contractAddress: string;
  balance: string;
}

export interface ContractOperationsCount {
  transferTotal: number;
  otherTotal;
}

export interface ContractProtocol {
  fetchTokenHolders(): Promise<TokenHolder[]>;
}

export interface Side {
  symbol: string;
  pool: number;
  price: number;
  usdvalue: number;
  dayClose: number;
  weekClose: number;
  monthClose: number;
  tokenType: string;
}

export interface Pair {
  address: string;
  dex: string;
  symbols: string;
  tvl: number;
  lptSupply: number;
  sides: Side[];
}

export interface TezToolsPrice {
  symbol: string;
  tokenAddress: string;
  decimals: number;
  name: string;
  shouldPreferSymbol: boolean;
  factoryIndex: number;
  address: string;
  ratio: number;
  tezPool: number;
  tokenPool: number;
  currentPrice: number;
  lastPrice: number;
  buyPrice: number;
  sellPrice: number;
  precision: number;
  type: string;
  bakerValidator: string;
  currentCandidate: string;
  currentDelegated: string;
  lastUpdateTime: Date;
  lastVeto: Date;
  periodFinish: Date;
  reward: number;
  rewardPaid: number;
  rewardPerSec: number;
  totalReward: number;
  totalSupply: number;
  qptTokenSupply: number;
  totalVotes: number;
  usdValue: number;
  pairs: Pair[];
  tags: string;
  websiteLink: string;
  telegramLink: string;
  twitterLink: string;
  discordLink: string;
  thumbnailUri: string;
  timestamp: Date;
  block: string;
}

export interface TezToolsResponse {
  contracts: TezToolsPrice[];
  block: string;
  timestamp: string;
  found: string;
  xtzusdValue: number;
}

export const getContractProtocol = (
  contract: TokenContract,
  chainNetworkService: ChainNetworkService
): ContractProtocol => {
  const environmentUrls = chainNetworkService.getEnvironment();
  const tezosNetwork = chainNetworkService.getNetwork();

  if (contract.type === 'fa2') {
    const options = getTezosFA2ProtocolOptions(
      contract,
      environmentUrls,
      tezosNetwork
    );
    return new TezosFA2Protocol(options);
  }

  const options = getTezosFAProtocolOptions(
    contract,
    environmentUrls,
    tezosNetwork
  );

  if (contract.type === 'fa1.2') {
    return new TezosFA1p2Protocol(options);
  }

  if (contract.symbol === 'STKR') {
    return new TezosStaker(options);
  }

  if (contract.symbol === 'tzBTC') {
    return new TezosBTC(options);
  }

  if (contract.symbol === 'USDtz') {
    return new TezosUSD(options);
  }

  if (contract.symbol === 'ETHtz') {
    return new TezosETHtz(options);
  }

  if (contract.symbol === 'wXTZ') {
    return new TezosWrapped(options);
  }

  if (contract.symbol === 'kUSD') {
    return new TezosKolibriUSD(options);
  }
  return undefined;
};

@Injectable({
  providedIn: 'root',
})
export class ContractService extends BaseService {
  protected readonly environmentUrls: EnvironmentUrls;
  private tezosToolkit: TezosToolkit;

  constructor(
    readonly chainNetworkService: ChainNetworkService,
    readonly httpClient: HttpClient
  ) {
    super(chainNetworkService, httpClient);
    this.environmentUrls = chainNetworkService.getEnvironment();
  }

  public fetchContractAssets(
    currentPage: number,
    selectedSize: number
  ): Observable<TokenAsset[]> {
    const limit = currentPage * selectedSize;

    return this.httpClient.get<TokenAsset[]>(
      `${this.environmentUrls.indexerUrl}/v1/tokens?sort.desc=transfersCount&limit=${limit}`
    );
  }

  public fetchLatestContracts(): Observable<TokenContract[]> {
    return this.httpClient
      .get<TokenAsset[]>(
        `${this.environmentUrls.indexerUrl}/v1/tokens?sort.desc=transfersCount&limit=6`
      )
      .pipe(
        switchMap((tokens) => {
          return forkJoin(
            tokens.map((token) =>
              this.fetchContractDetails(token.contract.address)
            )
          );
        })
      );
  }

  public fetchContractDetails(
    address: string,
    contract?: TokenContract
  ): Observable<TokenContract> {
    if (contract) {
      return of(contract);
    }
    return forkJoin({
      ledgerBigMapID: this.httpClient.get<number[]>(
        `${this.environmentUrls.indexerUrl}/v1/bigmaps?contract=${address}&tags.any=ledger&select.values=ptr`
      ),
      token: this.httpClient.get<TokenAsset[]>(
        `${this.environmentUrls.indexerUrl}/v1/tokens?contract=${address}&select=metadata,totalSupply,standard`
      ),
    }).pipe(
      map((observables) => ({
        contractAddress: address,
        name: isCurated(address)
          ? undefined
          : observables.token[0]?.metadata?.name,
        symbol: observables.token[0]?.metadata?.symbol,
        ledgerBigMapID: observables.ledgerBigMapID[0],
        totalSupply: new BigNumber(
          observables.token[0]?.totalSupply
        ).toString(),
        decimals: Number(observables.token[0]?.metadata?.decimals),
        id: address,
        type: observables.token[0]?.standard,
        thumbnailUri: (
          observables.token[0]?.metadata?.icon ??
          observables.token[0]?.metadata?.thumbnailUri
        )?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      }))
    );
  }

  public fetchTokensByAddress(address: string): Observable<ContractAsset[]> {
    return forkJoin({
      tezToolsResponse: this.httpClient.get<TezToolsResponse>(
        `https://api.teztools.io/v1/prices`
      ),
      tokens: this.httpClient.get<TZKtTokenBalance[]>(
        `${this.environmentUrls.indexerUrl}/v1/tokens/balances?account=${address}&select=token,balance`
      ),
    }).pipe(
      map((observables) => {
        const prices = observables.tezToolsResponse.contracts;
        return observables.tokens
          .map((token: TZKtTokenBalance) => {
            const tezToolsPrice = prices.find(
              (price) => price.symbol === token.token?.metadata?.symbol
            );

            const tokenBalanceShifted = token.token?.metadata?.decimals
              ? new BigNumber(token.balance).shiftedBy(
                  -Number(token.token.metadata.decimals)
                )
              : new BigNumber(0);

            const value = tezToolsPrice
              ? new BigNumber(tokenBalanceShifted)
                  .times(tezToolsPrice.currentPrice)
                  .times(observables.tezToolsResponse?.xtzusdValue)
                  .toString()
              : '0';

            return {
              contract: {
                contractAddress: token.token?.contract?.address,
                symbol: token.token?.metadata?.symbol,
                name: token.token?.metadata?.name,
                type: token.token?.standard,
                tokenId: Number(token.token?.tokenId),
              },
              amount: new BigNumber(token.balance).toString(),
              value,
              decimals: Number(token.token?.metadata?.decimals) ?? 0,
              thumbnailUri: sanitizeThumbnailUri(token.token),
            };
          })
          .filter((asset) => asset.contract.name || asset.contract.symbol);
      })
    );
  }

  public wrapAssetsWithTez(
    assets: ContractAsset[],
    account: Account,
    price: BigNumber
  ): Observable<ContractAsset[]> {
    const decimals = 6;
    const tez = {
      contract: {
        contractAddress: ContractAddress.TEZ,
        symbol: ContractAddress.TEZ,
        type: 'fa2',
      },
      amount: String(account?.balance),
      value: price.times(account?.balance).shiftedBy(-decimals).toString(),
      decimals,
    } as ContractAsset;

    return of([tez].concat(assets));
  }

  public calculatePortfolioValue(
    portfolioAssets: ContractAsset[]
  ): Observable<string> {
    if (!portfolioAssets) {
      return of('0');
    }
    return of(
      new BigNumber(
        portfolioAssets
          .map((asset) => asset.value)
          .reduce(
            (partialSum, a) => new BigNumber(partialSum).plus(a),
            new BigNumber(0)
          )
      ).toFixed(2)
    );
  }

  public loadManagerAddress(address: string): Observable<string> {
    return this.post<{ source: string }[]>('operations', {
      fields: ['source'],
      predicates: [
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['origination'],
          inverse: false,
        },
        {
          field: 'originated_contracts',
          operation: Operation.eq,
          set: [address],
          inverse: false,
        },
      ],
      orderBy: [
        {
          field: 'block_level',
          direction: 'desc',
        },
      ],
      limit: 1,
    }).pipe(
      map(
        pipe(
          first,
          get((data) => data.source)
        )
      )
    );
  }

  public loadOperationsCount(
    contractHash: string
  ): Observable<ContractOperationsCount> {
    return forkJoin([
      this.post<any[]>('operations', {
        fields: ['destination'],
        predicates: transferPredicates(contractHash),
        aggregation: [
          {
            field: 'destination',
            function: 'count',
          },
        ],
      }).pipe(
        map(
          pipe(
            first,
            get<any>((item) => parseInt(item.count_destination))
          )
        )
      ),
      this.post<any[]>('operations', {
        fields: ['destination'],
        predicates: otherPredicates(contractHash),
        aggregation: [
          {
            field: 'destination',
            function: 'count',
          },
        ],
      }).pipe(
        map(
          pipe(
            first,
            get<any>((item) => parseInt(item.count_destination))
          )
        )
      ),
    ]).pipe(
      map(([transferTotal, otherTotal]) => ({ transferTotal, otherTotal }))
    );
  }

  public loadOtherOperations(
    contract: TokenContract,
    orderBy: OrderBy,
    limit: number
  ): Observable<ContractOperation[]> {
    const faProtocol = getFaProtocol(
      contract,
      this.chainNetworkService.getEnvironment(),
      this.chainNetworkService.getNetwork()
    );

    return this.post<ContractOperation[]>('operations', {
      predicates: otherPredicates(contract.id),
      orderBy: [orderBy],
      limit,
    }).pipe(
      switchMap((contractOperations) =>
        contractOperations.length > 0
          ? forkJoin(
              contractOperations.map((contractOperation) =>
                from(
                  faProtocol.normalizeTransactionParameters(
                    contractOperation.parameters_micheline
                  )
                ).pipe(
                  catchError(() => of({ entrypoint: 'default', value: null }))
                )
              )
            ).pipe(
              map((response) =>
                contractOperations.map((contractOperation, index) => ({
                  ...contractOperation,
                  entrypoint:
                    contractOperation.parameters_entrypoints === 'default'
                      ? _get(response[index], 'entrypoint')
                      : contractOperation.parameters_entrypoints,
                  // symbol: contract.symbol,
                  decimals: contract.decimals,
                }))
              )
            )
          : of([])
      )
    );
  }

  public loadTransferOperations(
    contract: TokenContract,
    orderBy: OrderBy,
    limit: number
  ): Observable<ContractOperation[]> {
    return this.post<ContractOperation[]>('operations', {
      predicates: transferPredicates(contract.id),
      orderBy: [orderBy],
      limit,
    }).pipe(
      switchMap(
        (contractOperations) =>
          <Observable<ContractOperation[]>>(
            from(
              fillTransferOperations(
                contractOperations,
                this.chainNetworkService,
                () => undefined,
                contract
              )
            )
          )
      )
    );
  }

  public loadPreviewTransferOperations(
    address: string,
    orderBy: OrderBy,
    limit: number
  ): Observable<TZKtTransaction[]> {
    return this.httpClient
      .get<TZKtTokenTransfer[]>(
        `${this.environmentUrls.indexerUrl}/v1/tokens/transfers?token.contract=${address}&limit=${limit}`
      )
      .pipe(
        switchMap((transfers) =>
          transfers.map((transfer) =>
            this.httpClient.get<TZKtTransaction[]>(
              `${this.environmentUrls.indexerUrl}/v1/operations/transactions?id=${transfer.transactionId}`
            )
          )
        ),
        switchMap((transactions) => transactions)
      );
  }

  public load24hTransferOperations(
    contract: TokenContract
  ): Observable<ContractOperation[]> {
    const cutoff = moment().subtract(24, 'hours');

    return this.post<ContractOperation[]>('operations', {
      fields: [
        'timestamp',
        'parameters_entrypoints',
        'parameters_micheline',
        'parameters',
        'kind',
      ],
      predicates: [
        {
          field: 'parameters_entrypoints',
          operation: Operation.eq,
          set: ['transfer'],
          inverse: false,
        },
        {
          field: 'parameters',
          operation: Operation.isnull,
          set: [],
          inverse: true,
        },
        {
          field: 'kind',
          operation: Operation.eq,
          set: ['transaction'],
          inverse: false,
        },
        {
          field: 'destination',
          operation: Operation.eq,
          set: [contract.id],
          inverse: false,
        },
        {
          field: 'status',
          operation: Operation.eq,
          set: ['applied'],
          inverse: false,
        },
        {
          field: 'timestamp',
          operation: Operation.gt,
          set: [cutoff.toDate().getTime()],
          inverse: false,
        },
      ],
    }).pipe(
      switchMap(
        (contractOperations) =>
          <Observable<ContractOperation[]>>(
            from(
              fillTransferOperations(
                contractOperations,
                this.chainNetworkService,
                () => undefined,
                contract
              )
            )
          )
      )
    );
  }

  public loadTokenHolders(contract: TokenContract): Observable<TokenHolder[]> {
    return from(
      getContractProtocol(
        contract,
        this.chainNetworkService
      )?.fetchTokenHolders()
    );
  }

  public getTotalSupplyByContract(contract: TokenContract): Observable<string> {
    if (contract.totalSupply !== undefined) {
      return from(
        new Promise<string>((resolve) => {
          resolve(contract.totalSupply);
        })
      );
    }
    const protocol = getFaProtocol(
      contract,
      this.chainNetworkService.getEnvironment(),
      this.chainNetworkService.getNetwork()
    );

    if (contract.type === 'fa2') {
      return from((protocol as TezosFA2Protocol).getTotalSupply());
    }
    return from((protocol as TezosFA1Protocol).getTotalSupply());
  }

  public loadEntrypoints(id: string): Observable<string[]> {
    return this.get(
      `${ENVIRONMENT_URL.rpcUrl}/chains/main/blocks/head/context/contracts/${id}/entrypoints`,
      true
    ).pipe(
      map((response: any) => {
        return Object.keys(response.entrypoints);
      })
    );
  }

  public async generateTransferParams(
    source: string,
    destination: string,
    contractAddress: string,
    amount: string,
    tokenId: string,
    contractType: string
  ): Promise<TransferParams> {
    this.tezosToolkit =
      this.tezosToolkit ?? new TezosToolkit(this.environmentUrls.rpcUrl);

    switch (contractType) {
      case 'fa1.2':
        return (await this.tezosToolkit.contract.at(contractAddress)).methods
          .transfer(source, destination, amount)
          .toTransferParams();

      default:
        return (await this.tezosToolkit.wallet.at(contractAddress)).methods
          .transfer([
            {
              from_: source,
              txs: [
                {
                  to_: destination,
                  token_id: tokenId,
                  amount: amount,
                },
              ],
            },
          ])
          .toTransferParams();
    }
  }
}
