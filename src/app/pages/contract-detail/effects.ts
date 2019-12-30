import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { delay, map, tap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { BsModalService } from 'ngx-bootstrap'
import { ToastrService } from 'ngx-toastr'

import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { CopyService } from '@tezblock/services/copy/copy.service'
import { QrModalComponent } from '@tezblock/components/qr-modal/qr-modal.component'
import { TelegramModalComponent } from '@tezblock/components/telegram-modal/telegram-modal.component'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { getContractByAddress } from '@tezblock/domain/contract'

@Injectable()
export class ContractDetailEffects {
  getContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContract),
      map(({ address }) => {
        const contract = getContractByAddress(address)

        if (contract) {
          return actions.loadContractSucceeded({ contract: { ...contract, id: address } })
        }

        return actions.loadContractFailed({ error: 'Not Found' })
      })
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

  constructor(
    private readonly actions$: Actions,
    private readonly aliasPipe: AliasPipe,
    private readonly copyService: CopyService,
    private readonly modalService: BsModalService,
    private readonly store$: Store<fromRoot.State>,
    private readonly toastrService: ToastrService
  ) {}
}
