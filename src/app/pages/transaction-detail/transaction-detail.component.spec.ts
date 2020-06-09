import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { TabsetConfig, TabsModule } from 'ngx-bootstrap/tabs'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { MomentModule } from 'ngx-moment'
import { Actions } from '@ngrx/effects'
import { ToastrModule, ToastrService } from 'ngx-toastr'
import { EMPTY } from 'rxjs'

import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { TabbedTableComponent } from 'src/app/components/tabbed-table/tabbed-table.component'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { TransactionItemComponent } from 'src/app/components/transaction-item/transaction-item.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { TransactionDetailWrapperComponent } from 'src/app/components/transaction-detail-wrapper/transaction-detail-wrapper.component'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { AmountConverterPipe } from './../../pipes/amount-converter/amount-converter.pipe'
import { TransactionDetailComponent } from './transaction-detail.component'
import { AmountCellComponent } from 'src/app/components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { TooltipItemComponent } from 'src/app/components/tooltip-item/tooltip-item.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

xdescribe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent
  let fixture: ComponentFixture<TransactionDetailComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe, TabsetConfig, BsModalService, ToastrService, { provide: Actions, useValue: EMPTY }],
        imports: [
          MomentModule,
          FontAwesomeModule,
          TabsModule,
          TooltipModule,
          ModalModule.forRoot(),
          ToastrModule.forRoot(),
          PaginationModule
        ],
        declarations: [
          TransactionDetailComponent,
          TabbedTableComponent,
          TezblockTableComponent,
          TransactionItemComponent,
          AddressItemComponent,
          IdenticonComponent,
          AmountCellComponent,
          BlockCellComponent,
          TransactionDetailWrapperComponent,
          LoadingSkeletonComponent,
          TooltipItemComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(TransactionDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
