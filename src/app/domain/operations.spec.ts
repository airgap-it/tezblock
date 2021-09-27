import {
  OperationErrorsById,
  OperationError,
  getTransactionsWithErrors,
} from './operations';
import { getInitialTableState, TableState } from '@tezblock/domain/table';

describe('operations', () => {
  describe('getTransactionsWithErrors', () => {
    it('when there is no match between operationErrorsById and transactions then in all transactions set errors to null', () => {
      const transactionA = { operation_group_hash: 'foo_1' };
      const tableState: TableState<any> = {
        ...getInitialTableState(),
        data: [transactionA],
      };
      const operationErrorsById: OperationErrorsById[] = [
        { id: 'foo_2', errors: [{ kind: 'foo_kind', id: 'foo_id' }] },
      ];
      const response = getTransactionsWithErrors(
        operationErrorsById,
        tableState
      );

      expect(<any>response.data[0]).toEqual({ ...transactionA, errors: null });
    });

    it('when there is match between operationErrorsById and transactions then set errors property', () => {
      const transactionA = { operation_group_hash: 'foo_1' };
      const tableState: TableState<any> = {
        ...getInitialTableState(),
        data: [transactionA],
      };
      const errors = [{ kind: 'foo_kind', id: 'foo_id' }];
      const operationErrorsById: OperationErrorsById[] = [
        { id: 'foo_1', errors },
      ];
      const response = getTransactionsWithErrors(
        operationErrorsById,
        tableState
      );

      expect(<any>response.data[0]).toEqual({ ...transactionA, errors });
    });
  });
});
