import { ProtocolSymbols, TezosProtocol } from '@airgap/coinlib-core';
import { TezosContractRemoteDataFactory } from '@airgap/coinlib-core/protocols/tezos/contract/remote-data/TezosContractRemoteDataFactory';
import { TezosFATokenMetadata } from '@airgap/coinlib-core/protocols/tezos/types/fa/TezosFATokenMetadata';
import { Injectable } from '@angular/core';
import { gql, request } from 'graphql-request';
import { ChainNetworkService } from '../chain-network/chain-network.service';
import { CollectibleCursor } from './collectibles.types';

import { TezosCollectible } from './tezos/explorer/TezosCollectibleExplorer';

const OBJKT_API_URL = 'https://data.objkt.com/v1/graphql';
const OBJKT_PAGE_URL = 'https://objkt.com';
const OBJKT_ASSETS_URL = 'https://assets.objkt.com/file/assets-001';
export const DEFAULT_COLLECTIBLES_LIMIT = 12;

@Injectable({
  providedIn: 'root',
})
export class CollectiblesService {
  private readonly remoteDataFactory: TezosContractRemoteDataFactory =
    new TezosContractRemoteDataFactory();
  private readonly collectibles: Map<string, TezosCollectible> = new Map();
  private readonly tokenMetadata: Map<string, TezosFATokenMetadata> = new Map();

  public constructor(
    private readonly chainNetworkService: ChainNetworkService
  ) {}

  public async getCollectibles(
    address: string,
    limit: number
  ): Promise<CollectibleCursor> {
    const tezosProtocol = new TezosProtocol();

    const { token_holder: tokenHolders } =
      await this.fetchTokenHoldersForAddress(address, limit, 0);

    const collectiblesOrUndefined:
      | (TezosCollectible | undefined)[]
      | undefined = await Promise.all(
      tokenHolders
        ?.slice(0, limit)
        ?.map(async (tokenHolder) =>
          this.tokenToTezosCollectible(tezosProtocol, tokenHolder)
        )
    );

    const collectibles: TezosCollectible[] =
      collectiblesOrUndefined?.filter(
        (collectible) => collectible !== undefined
      ) ?? [];
    this.cacheCollectibles(collectibles);

    const hasNext = tokenHolders.length === limit;
    return {
      collectibles,
      hasNext,
    };
  }

  public async getCollectiblesCount(address: string): Promise<number> {
    const { token_holder: noLimitTokenHolders } =
      await this.fetchTokenHoldersForAddress(address, 1000000000, 0);
    return noLimitTokenHolders.length;
  }

  private async fetchTokenHoldersForAddress(
    address: string,
    limit: number,
    offset: number
  ): Promise<TokenHolderResponse> {
    const query = gql`
      {
        token_holder(limit: ${limit}, offset: ${offset}, where: {
          holder_id: {
            _eq: "${address}"
          },
          token: {
            id: {
              _nlike: ""
            },
            fa2_id: {
              _nlike: ""
            }
          },
          quantity: {
            _gt: 0
          }
        }) {
          token {
            id
            metadata
            description
            title
            fa2 {
              contract
              name
            }
          }
          quantity
        }
      }
    `;

    return request(OBJKT_API_URL, query);
  }

  private async tokenToTezosCollectible(
    protocol: TezosProtocol,
    tokenHolder: TokenHolder
  ): Promise<TezosCollectible | undefined> {
    const id = tokenHolder.token?.id;
    const amount = tokenHolder.quantity;
    const metadataUri = tokenHolder.token?.metadata;
    const contractAddress = tokenHolder.token?.fa2?.contract;
    const contractName = tokenHolder.token?.fa2?.name;
    const description = tokenHolder.token?.description;
    const title = tokenHolder.token?.title;

    if (!id || !contractAddress) {
      return undefined;
    }

    return {
      protocolIdentifier: faProtocolSymbol('2', contractAddress),
      networkIdentifier: protocol.options.network.identifier,
      id,
      thumbnail: this.getAssetUrl(contractAddress, id, 'thumb288'),
      contract: {
        address: contractAddress,
        name: contractName,
      },
      description,
      name: title,
      displayImg: this.getAssetUrl(contractAddress, id, 'display'),
      amount: amount.toString(),
      address: { type: 'contract', value: contractAddress },
      moreDetails: {
        label: 'objkt-collectible-explorer.more-details.view-on',
        url: this.getDetailsUrl(contractAddress, id),
      },
      metadataUri,
    };
  }

  private getAssetUrl(
    contractAddress: string,
    tokenID: string,
    type: 'thumb288' | 'thumb400' | 'display'
  ): string {
    const path = tokenID.slice(-2).padStart(2, '0').split('').join('/');

    return `${OBJKT_ASSETS_URL}/${contractAddress}/${path}/${tokenID}/${type}`;
  }

  private getDetailsUrl(contractAddress: string, tokenID: string): string {
    return `${OBJKT_PAGE_URL}/asset/${contractAddress}/${tokenID}`;
  }

  private cacheCollectibles(collectibles: TezosCollectible[]): void {
    collectibles.forEach((collectible) => {
      this.cacheCollectible(collectible);
    });
  }

  private cacheCollectible(collectible: TezosCollectible): void {
    const key = this.getCollectibleKey(
      collectible.address.value,
      collectible.id
    );
    if (!this.collectibles.has(key)) {
      this.collectibles.set(key, collectible);
    }
  }

  private getCollectibleKey(contractAddress: string, tokenID: string): string {
    return `${contractAddress}:${tokenID}`;
  }
}

export enum GenericSubProtocolSymbol {
  XTZ_FA = 'xtz-fa',
}

export type GenericProtocolSymbols = GenericSubProtocolSymbol;

export function faProtocolSymbol(
  interfaceVersion: '1.2' | '2',
  contractAddress?: string,
  tokenID: number | string = 0
): ProtocolSymbols {
  let identifier = `${GenericSubProtocolSymbol.XTZ_FA}${interfaceVersion}`;
  if (contractAddress) {
    identifier += `_${contractAddress}_${tokenID}`;
  }

  return identifier as ProtocolSymbols;
}

interface Token {
  id?: string;
  metadata?: string;
  description?: string;
  title?: string;
  fa2?: FA2;
}

interface TokenHolder {
  token?: Token;
  quantity?: number;
}

interface FA2 {
  contract?: string;
  name?: string;
}

interface TokenHolderResponse {
  token_holder?: TokenHolder[];
}
