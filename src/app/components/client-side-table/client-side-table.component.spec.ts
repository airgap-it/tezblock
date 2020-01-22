import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { PaginationModule } from 'ngx-bootstrap/pagination'

import { ClientSideTableComponent } from './client-side-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { TezblockTable2Component } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
import { AmountCellComponent } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { AddressCellComponent } from '@tezblock/components/tezblock-table/address-cell/address-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'
import { LoadingSkeletonComponent } from '@tezblock/components/loading-skeleton/loading-skeleton.component'
import { AddressItemComponent } from '@tezblock/components/address-item/address-item.component'
import { IdenticonComponent } from '@tezblock/components/identicon/identicon'

describe('ClientSideTableComponent', () => {
  let component: ClientSideTableComponent
  let fixture: ComponentFixture<ClientSideTableComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [FontAwesomeModule, PaginationModule.forRoot()],
        declarations: [
          ClientSideTableComponent,
          TezblockTable2Component,
          LoadingSkeletonComponent,
          AmountCellComponent,
          AddressCellComponent,
          BlockCellComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent,
          AddressItemComponent,
          IdenticonComponent
        ]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSideTableComponent)
    component = fixture.componentInstance
    component.data = []
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
