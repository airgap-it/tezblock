import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { EMPTY } from 'rxjs'

import { AddressItemComponent } from 'src/app/components/address-item/address-item.component'
import { AddressCellComponent } from './../tezblock-table/address-cell/address-cell.component'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { TabbedTableComponent } from './tabbed-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from '../tezblock-table/amount-cell/amount-cell.component'
import { IdenticonComponent } from '../identicon/identicon'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

describe('TabbedTableComponent', () => {
  let component: TabbedTableComponent
  let fixture: ComponentFixture<TabbedTableComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [TabsModule, FontAwesomeModule, PaginationModule],
        declarations: [
          TabbedTableComponent,
          TezblockTableComponent,
          IdenticonComponent,
          LoadingSkeletonComponent,
          AddressCellComponent,
          AmountCellComponent,
          BlockCellComponent,
          AddressItemComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TabbedTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
