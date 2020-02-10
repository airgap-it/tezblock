import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { Store } from '@ngrx/store'
import { ModalModule, TabsetConfig, TabsModule, TooltipModule } from 'ngx-bootstrap'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

import { ProposalDetailComponent } from './proposal-detail.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { storeMock } from 'test-config/mocks'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { TabbedTableComponent } from './../../components/tabbed-table/tabbed-table.component'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { AddressCellComponent } from 'src/app/components/tezblock-table/address-cell/address-cell.component'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { AmountCellComponent } from 'src/app/components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { TooltipItemComponent } from 'src/app/components/tooltip-item/tooltip-item.component'
import { ChartItemComponent } from '@tezblock/components/chart-item/chart-item.component'
import { ClientSideTableComponent } from '@tezblock/components/client-side-table/client-side-table.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent
  let fixture: ComponentFixture<ProposalDetailComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [FontAwesomeModule, TooltipModule.forRoot(), TabsModule, ModalModule.forRoot()],
        declarations: [
          ProposalDetailComponent,
          LoadingSkeletonComponent,
          TabbedTableComponent,
          TezblockTableComponent,
          IdenticonComponent,
          AddressCellComponent,
          AddressItemComponent,
          AmountCellComponent,
          BlockCellComponent,
          TooltipItemComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent
        ],
        providers: [{ provide: Store, useValue: storeMock }, { provide: Actions, useValue: EMPTY }, TabsetConfig]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
