import { ProtocolSymbols, TezosProtocol } from '@airgap/coinlib-core';
import { Injectable } from '@angular/core';
import { gql, request } from 'graphql-request';
import { CollectibleCursor } from './collectibles.types';

import { TezosCollectible } from './tezos/explorer/TezosCollectibleExplorer';

const OBJKT_API_URL = 'https://data.objkt.com/v2/graphql';
const OBJKT_PAGE_URL = 'https://objkt.com';
const OBJKT_ASSETS_URL = 'https://assets.objkt.media/file/assets-003';
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
            artifact_uri
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
      thumbnail: await this.getAssetUrl(contractAddress, id, 'thumb288'),
      contract: {
        address: contractAddress,
        name: contractName,
      },
      description,
      name,
      displayImg: await this.getAssetUrl(
        contractAddress,
        id,
        'artifact',
        tokenHolder.token?.artifact_uri
      ),
      amount: amount.toString(),
      address: { type: 'contract', value: contractAddress },
      moreDetails: {
        label: 'objkt-collectible-explorer.more-details.view-on',
        url: this.getDetailsUrl(contractAddress, id),
      },
      metadataUri,
    };
  }

  private async getAssetUrl(
    contractAddress: string,
    tokenID: string,
    type: 'thumb288' | 'thumb400' | 'artifact',
    artifactUri?: string
  ): Promise<string> {
    if (artifactUri) {
      if (artifactUri.startsWith('ipfs')) {
        const sanitizedArtifactUri = artifactUri.replace('ipfs://', '');
        if (artifactUri.indexOf('?') !== -1) {
          const split = sanitizedArtifactUri.split('?');
          return `${OBJKT_ASSETS_URL}/${split[0]}/artifact/index.html?${split[1]}`; // query params in artifact_uri
        }
        return `${OBJKT_ASSETS_URL}/${sanitizedArtifactUri}/artifact`; // Single files (in directory) over IPFS
      }

      const digest = await this.digestMessage(artifactUri);
      return `${OBJKT_ASSETS_URL}/${digest}/artifact`; // Single files over HTTP(s)
    }
    return `${OBJKT_ASSETS_URL}/${contractAddress}/${tokenID}/${type}`; // Thumbs
  }

  // From OBJKT CDN V2 documentation at https://gist.github.com/vhf/e6f63e4b9f400caa115884a19a12b5d4#objktcom-assets-cdn-v2
  private async digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
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
  artifact_uri?: string;
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
