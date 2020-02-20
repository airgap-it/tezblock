import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
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
import { getContractByAddress, Contract } from '@tezblock/domain/contract'
import { ApiService } from '@tezblock/services/api/api.service'
import { get } from '@tezblock/services/fp'

@Injectable()
export class ContractDetailEffects {
  getContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContract),
      switchMap(({ address }) => {
        const contract = get<Contract>(_contract => ({ ..._contract, id: address }))(getContractByAddress(address))

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

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMoreTransferOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([action, contract]) => actions.loadTransferOperations({ contract }))
    )
  )

  sortTransferOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortTransferOperations),
      withLatestFrom(this.store$.select(state => state.contractDetails.contract)),
      map(([action, contract]) => actions.loadTransferOperations({ contract }))
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly aliasPipe: AliasPipe,
    private readonly apiService: ApiService,
    private readonly copyService: CopyService,
    private readonly modalService: BsModalService,
    private readonly store$: Store<fromRoot.State>,
    private readonly toastrService: ToastrService
  ) {}
}
