import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ChartsModule } from 'ng2-charts'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { BakerOverviewComponent } from './baker-overview.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { ChartItemComponent } from '@tezblock/components/chart-item/chart-item.component'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { AccountItemComponent } from '@tezblock/components/account-item/account-item.component'
import { AmountCellComponent } from 'src/app/components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { AddressItemComponent } from '@tezblock/components/address-item/address-item.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

// TODO: problem: Failed: Template parse errors: Can't bind to 'address' since it isn't a known property of 'address-item'.
xdescribe('BakerOverviewComponent', () => {
  let component: BakerOverviewComponent
  let fixture: ComponentFixture<BakerOverviewComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [
          BakerOverviewComponent,
          LoadingSkeletonComponent,
          ChartItemComponent,
          TezblockTableComponent,
          IdenticonComponent,
          AccountItemComponent,
          AddressItemComponent,
          AmountCellComponent,
          BlockCellComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent
        ],
        imports: [FontAwesomeModule, ChartsModule]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BakerOverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
