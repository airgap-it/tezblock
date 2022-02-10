import {
  Collectible,
  CollectibleDetails,
  isCollectible,
} from '../../collectibles.types';

export interface TezosCollectible extends Collectible, CollectibleDetails {
  contract: {
    address: string;
    name?: string;
  };
  description?: string;
  metadataUri?: string;
}

export function isTezosCollectible(value: unknown): value is TezosCollectible {
  if (!isCollectible(value)) {
    return false;
  }

  const partialCollectible = value as Partial<TezosCollectible>;

  return partialCollectible.contract !== undefined;
}
