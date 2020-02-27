import { createReducer, on } from '@ngrx/store'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { Account } from '@tezblock/interfaces/Account'

import * as actions from './actions'

export interface State {
  accounts: TableState<Account>
  top25Accounts: Account[]
  top25AccountsLoading: boolean
}

export interface Sorting {
  direction: string
  value: string
}

const initialState: State = {
  accounts: getInitialTableState({ field: 'balance', direction: 'desc' }),
  top25Accounts: undefined,
  top25AccountsLoading: undefined
}

export const reducer = createReducer(
  initialState,

  on(actions.loadAccounts, state => ({
    ...state,
    accounts: {
      ...state.accounts,
      loading: true
    }
  })),
  on(actions.loadAccountsSucceeded, (state, { accounts }) => ({
    ...state,
    accounts: {
      ...state.accounts,
      data: accounts,
      loading: false
    }
  })),
  on(actions.loadAccountsFailed, state => ({
    ...state,
    accounts: {
      ...state.accounts,
      loading: false
    }
  })),
  on(actions.increasePageOfAccounts, state => ({
    ...state,
    accounts: {
      ...state.accounts,
      pagination: {
        ...state.accounts.pagination,
        currentPage: state.accounts.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortAccounts, (state, { orderBy }) => ({
    ...state,
    accounts: {
      ...state.accounts,
      orderBy
    }
  })),

  on(actions.loadTop25Accounts, state => ({
    ...state,
    top25AccountsLoading: true
  })),
  on(actions.loadTop25AccountsSucceeded, (state, { top25Accounts }) => ({
    ...state,
    top25Accounts: top25Accounts,
    top25AccountsLoading: false
  })),
  on(actions.loadTop25AccountsFailed, state => ({
    ...state,
    top25AccountsLoading: false
  })),

  on(actions.reset, () => initialState)
)
