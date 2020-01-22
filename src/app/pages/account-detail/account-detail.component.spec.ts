import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ModalModule, TabsetConfig, TabsModule, TooltipModule } from 'ngx-bootstrap'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ProgressbarConfig, ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { ToastrModule, ToastrService } from 'ngx-toastr'
import { MomentModule } from 'ngx-moment'
import { ChartsModule } from 'ng2-charts'

import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { TezblockTable2Component } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { TabbedTableComponent } from './../../components/tabbed-table/tabbed-table.component'
import { AmountConverterPipe } from './../../pipes/amount-converter/amount-converter.pipe'
import { AccountDetailComponent } from './account-detail.component'
import { BakerTableComponent } from './../../components/baker-table/baker-table.component'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { AddressCellComponent } from 'src/app/components/tezblock-table/address-cell/address-cell.component'
import { AmountCellComponent } from 'src/app/components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { TooltipItemComponent } from 'src/app/components/tooltip-item/tooltip-item.component'
import { ChartItemComponent } from '@tezblock/components/chart-item/chart-item.component'
import { ClientSideTableComponent } from '@tezblock/components/client-side-table/client-side-table.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent
  let fixture: ComponentFixture<AccountDetailComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          AmountConverterPipe,
          BsModalService,
          TabsetConfig,
          ToastrService,
          IconPipe,
          ProgressbarConfig,
          { provide: Actions, useValue: EMPTY }
        ],
        imports: [
          TooltipModule,
          ProgressbarModule,
          FontAwesomeModule,
          TabsModule,
          ModalModule.forRoot(),
          ToastrModule.forRoot(),
          MomentModule,
          PaginationModule,
          ChartsModule
        ],
        declarations: [
          AccountDetailComponent,
          BakerTableComponent,
          IdenticonComponent,
          AddressItemComponent,
          AddressCellComponent,
          AmountCellComponent,
          BlockCellComponent,
          TabbedTableComponent,
          TezblockTable2Component,
          LoadingSkeletonComponent,
          TooltipItemComponent,
          ChartItemComponent,
          ClientSideTableComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(AccountDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
