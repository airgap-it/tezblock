import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { map, withLatestFrom, switchMap, catchError } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as listActions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import { BaseService, Operation } from '@tezblock/services/base.service'
import * as fromRoot from '@tezblock/reducers'
import { toNotNilArray } from '@tezblock/services/fp'
import { of } from 'rxjs'
import { Account } from '@tezblock/interfaces/Account'

@Injectable()
export class AccountsEffects {
  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadAccounts),
      withLatestFrom(
        this.store$.select(state => state.accountsList.accounts.pagination),
        this.store$.select(state => state.accountsList.accounts.orderBy).pipe(map(toNotNilArray))
      ),
      switchMap(([action, pagination, orderBy]) =>
        this.baseService
          .post<Account[]>('accounts', {
            fields: [],
            predicates: [
              {
                field: 'account_id',
                operation: Operation.startsWith,
                set: ['tz'],
                inverse: false
              }
            ],
            orderBy,
            limit: pagination.currentPage * pagination.selectedSize
          })
          .pipe(
            map(accounts => listActions.loadAccountsSucceeded({ accounts })),
            catchError(error => of(listActions.loadAccountsFailed({ error })))
          )
      )
    )
  )

  loadTop25Accounts = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTop25Accounts),
      switchMap(() =>
        this.baseService
          .post<Account[]>('accounts', {
            fields: [],
            predicates: [
              {
                field: 'account_id',
                operation: Operation.startsWith,
                set: ['tz'],
                inverse: false
              }
            ],
            orderBy: [{ field: 'balance', direction: 'desc' }],
            limit: 25
          })
          .pipe(
            map(top25Accounts => listActions.loadTop25AccountsSucceeded({ top25Accounts })),
            catchError(error => of(listActions.loadTop25AccountsFailed({ error })))
          )
      )
    )
  )

  onSortAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortAccounts),
      map(() => listActions.loadAccounts())
    )
  )

  increasePageOfAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfAccounts),
      map(() => listActions.loadAccounts())
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
