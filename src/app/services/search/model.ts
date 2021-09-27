import { OperationTypes } from '@tezblock/domain/operations';

export interface SearchOptionData {
  id: string;
  label?: string;
  type: OperationTypes;
}
