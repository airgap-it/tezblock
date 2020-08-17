import { Body, Operation } from '@tezblock/services/base.service'

export const getAccountByIdBody = (id: string): Body => ({
  predicates: [
    {
      field: 'account_id',
      operation: Operation.eq,
      set: [id],
      inverse: false
    }
  ],
  limit: 1
})
