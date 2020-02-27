import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, pipe, forkJoin } from 'rxjs'
import { catchError, delay, map, tap, withLatestFrom, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { BsModalService } from 'ngx-bootstrap'
import { ToastrService } from 'ngx-toastr'

import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { CopyService } from '@tezblock/services/copy/copy.service'
import { QrModalComponent } from '@tezblock/components/qr-modal/qr-modal.component'
import { TelegramModalComponent } from '@tezblock/components/telegram-modal/telegram-modal.component'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { getTokenContractByAddress, TokenContract, ContractOperation } from '@tezblock/domain/contract'
import { ApiService } from '@tezblock/services/api/api.service'
import { first, get } from '@tezblock/services/fp'
import { BaseService, Operation, Predicate } from '@tezblock/services/base.service'

const transferPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters',
    operation: Operation.like,
    set: ['"transfer"'],
    inverse: false
  },
  {
    field: 'kind',
    operation: Operation.eq,
    set: ['transaction'],
    inverse: false
  },
  {
    field: 'destination',
    operation: Operation.eq,
    set: [contractHash],
    inverse: false
  }
]

const otherPredicates = (contractHash: string): Predicate[] => [
  {
    field: 'parameters',
    operation: Operation.like,
    set: ['"transfer"'],
    inverse: true
  },
  {
    field: 'parameters',
    operation: Operation.isnull,
    set: [''],
    inverse: true
  },
  {
    field: 'kind',
    operation: Operation.eq,
    set: ['transaction'],
    inverse: false
  },
  {
    field: 'destination',
    operation: Operation.eq,
    set: [contractHash],
    inverse: false
  }
]

@Injectable()
export class ContractDetailEffects {
  getContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContract),
      switchMap(({ address }) => {
        const contract = get<TokenContract>(_contract => ({ ..._contract, id: address }))(getTokenContractByAddress(address))

        if (contract) {
          return this.apiService.getTotalSupplyByContract(contract).pipe(
            map(totalSupply => actions.loadContractSucceeded({ contract: { ...contract, totalSupply } })),
            catchError(error => of(actions.loadContractFailed({ error })))
          )
        }

        return of(actions.loadContractFailed({ error: 'Not Found' }))
      })
    )
  )

  onContractGetOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractSucceeded),
      map(({ contract }) => actions.loadTransferOperations({ contract }))
    )
  )

  copyAddressToClipboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.copyAddressToClipboard),
      tap(({ address }) => {
        this.copyService.copyToClipboard(address)
        this.toastrService.success('has been copied to clipboard', address)
      }),
      map(() => actions.copyAddressToClipboardSucceeded())
    )
  )

  oncopyAddressToClipboardSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.copyAddressToClipboardSucceeded),
      delay(1500),
      map(() => actions.resetCopyToClipboardState())
    )
  )

  showQr$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.showQr),
        withLatestFrom(this.store$.select(state => state.contractDetails.address)),
        tap(([action, address]) => {
          const initialState = { qrdata: address, size: 200 }
          const modalRef = this.modalService.show(QrModalComponent, { initialState })
          modalRef.content.closeBtnName = 'Close'
        })
      ),
    { dispatch: false }
  )

  showTelegramModal$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.showTelegramModal),
        withLatestFrom(this.store$.select(state => state.contractDetails.address)),
        tap(([action, address]) => {
          const initialState = {
            botAddress: address,
            botName: this.aliasPipe.transform(address)
          }
          const modalRef = this.modalService.show(TelegramModalComponent, { initialState })
          modalRef.content.closeBtnName = 'Close'
        })
      ),
    { dispatch: false }
  )

  loadTransferOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransferOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.cursor)),
      switchMap(([{ contract }, cursor]) =>
        this.apiService.getTransferOperationsForContract(contract, cursor).pipe(
          map(transferOperations => actions.loadTransferOperationsSucceeded({ transferOperations })),
          catchError(error => of(actions.loadTransferOperationsFailed({ error })))
        )
      )
    )
  )

  loadMoreTransferOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMoreTransferOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([action, contract]) => actions.loadTransferOperations({ contract }))
    )
  )

  // sortTransferOperations$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(actions.sortTransferOperations),
  //     withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
  //     map(([action, contract]) => actions.loadTransferOperations({ contractHash: contract.id }))
  //   )
  // )

  onLoadOperationsLoadCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransferOperations, actions.loadOtherOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([action, contract]) => actions.loadOperationsCount({ contractHash: contract.id }))
    )
  )

  loadOperationsCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationsCount),
      switchMap(({ contractHash }) =>
        forkJoin(
          this.baseService
            .post<any[]>('operations', {
              fields: ['destination'],
              predicates: transferPredicates(contractHash),
              aggregation: [
                {
                  field: 'destination',
                  function: 'count'
                }
              ]
            })
            .pipe(
              map(
                pipe(
                  first,
                  get<any>(item => parseInt(item.count_destination))
                )
              )
            ),
          this.baseService
            .post<any[]>('operations', {
              fields: ['destination'],
              predicates: otherPredicates(contractHash),
              aggregation: [
                {
                  field: 'destination',
                  function: 'count'
                }
              ]
            })
            .pipe(
              map(
                pipe(
                  first,
                  get<any>(item => parseInt(item.count_destination))
                )
              )
            )
        ).pipe(
          map(([transferTotal, otherTotal]) => actions.loadOperationsCountSucceeded({ transferTotal, otherTotal })),
          catchError(error => of(actions.loadOperationsCountFailed({ error })))
        )
      )
    )
  )

  loadOtherOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOtherOperations),
      withLatestFrom(
        this.store$.select(state => state.contractDetails.otherOperations.pagination),
        this.store$.select(state => state.contractDetails.otherOperations.orderBy)
      ),
      switchMap(([{ contractHash }, pagination, orderBy]) =>
        this.baseService
          .post<ContractOperation[]>('operations', {
            predicates: otherPredicates(contractHash),
            orderBy: [orderBy],
            limit: pagination.currentPage * pagination.selectedSize
          })
          .pipe(
            map(otherOperations => actions.loadOtherOperationsSucceeded({ otherOperations })),
            catchError(error => of(actions.loadOtherOperationsFailed({ error })))
          )
      )
    )
  )

  loadMoreOtherOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMoreOtherOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([action, contract]) => actions.loadOtherOperations({ contractHash: contract.id }))
    )
  )

  sortOtherOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortOtherOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([action, contract]) => actions.loadOtherOperations({ contractHash: contract.id }))
    )
  )

  onChangeOperationsTabLoadOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.changeOperationsTab),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([{ currentTabKind }, contract]) =>
        currentTabKind === actions.OperationTab.transfers
          ? actions.loadTransferOperations({ contract })
          : actions.loadOtherOperations({ contractHash: contract.id })
      )
    )
  )

  loadMore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMore),
      withLatestFrom(this.store$.select(state => state.contractDetails.currentTabKind)),
      map(([action, currentTabKind]) =>
        currentTabKind === actions.OperationTab.transfers ? actions.loadMoreTransferOperations() : actions.loadMoreOtherOperations()
      )
    )
  )

  sortOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.currentTabKind)),
      map(([{ orderBy }, currentTabKind]) =>
        // currentTabKind === actions.OperationTab.transfers
        //   ? actions.sortTransferOperations({ orderBy }) :
          actions.sortOtherOperations({ orderBy })
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly aliasPipe: AliasPipe,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly copyService: CopyService,
    private readonly modalService: BsModalService,
    private readonly store$: Store<fromRoot.State>,
    private readonly toastrService: ToastrService
  ) {}
}
