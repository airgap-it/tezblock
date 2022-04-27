import { ProtocolSymbols, TezosProtocol } from '@airgap/coinlib-core';
import { Injectable } from '@angular/core';
import { gql, request } from 'graphql-request';
import { CollectibleCursor } from './collectibles.types';

import { TezosCollectible } from './tezos/explorer/TezosCollectibleExplorer';

const OBJKT_API_URL = 'https://data.objkt.com/v2/graphql';
const OBJKT_PAGE_URL = 'https://objkt.com';
const OBJKT_ASSETS_URL = 'https://assets.objkt.com/file/assets-001';
export const DEFAULT_COLLECTIBLES_LIMIT = 12;

@Injectable({
  providedIn: 'root',
})
export class CollectiblesService {
  private readonly collectibles: Map<string, TezosCollectible> = new Map();

  public constructor() {}

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

  public async getCollectiblesCount(
    address: string,
    offset: number = 0,
    carry: number = 0,
    tries: number = 0
  ): Promise<number> {
    const maxTries = 5;
    const runQuery = async (address: string, offset: number): Promise<any> => {
      // OBJKT API is limited to max 500 results
      const query = gql`
        {
          token_holder(where: {holder_address: {_eq: ${address}}}, limit: 500, offset: ${offset}) { 
            token {
              token_id
            }
          }
        }
    `;
      return request(OBJKT_API_URL, query);
    };

    const { token_holder: collectibles } = await runQuery(address, offset);

    if (collectibles.length < 500 || tries === maxTries) {
      return collectibles.length + carry;
    }

    return this.getCollectiblesCount(
      address,
      (offset += 500),
      (carry += collectibles.length),
      (tries += 1)
    );
  }

  private async fetchTokenHoldersForAddress(
    address: string,
    limit: number,
    offset: number
  ): Promise<TokenHolderResponse> {
    const query = gql`
      {
        token_holder(limit: ${limit}, offset: ${offset}, where: {
          holder_address: {
            _eq: "${address}"
          },
          token: {
            token_id: {
              _nlike: ""
            },
            fa_contract: {
              _nlike: ""
            }
          },
          quantity: {
            _gt: 0
          }
          
        },
        order_by: {
          token_pk: desc
        }) {
          token {
            token_id
            metadata
            description
            name
            fa {
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
    const id = tokenHolder.token?.token_id;
    const amount = tokenHolder.quantity;
    const metadataUri = tokenHolder.token?.metadata;
    const contractAddress = tokenHolder.token?.fa?.contract;
    const contractName = tokenHolder.token?.fa?.name;
    const description = tokenHolder.token?.description;
    const name = tokenHolder.token?.name ?? description;

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
      name,
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
  token_id?: string;
  metadata?: string;
  description?: string;
  name?: string;
  fa?: FA;
}

interface TokenHolder {
  token?: Token;
  quantity?: number;
}

interface FA {
  contract?: string;
  name?: string;
}

interface TokenHolderResponse {
  token_holder?: TokenHolder[];
}
