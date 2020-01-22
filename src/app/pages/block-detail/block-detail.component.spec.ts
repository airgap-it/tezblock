import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CollapseModule } from 'ngx-bootstrap'
import { TabsetConfig, TabsModule } from 'ngx-bootstrap/tabs'
import { MomentModule } from 'ngx-moment'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

import { AddressCellComponent } from 'src/app/components/tezblock-table/address-cell/address-cell.component'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { TezblockTable2Component } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { TabbedTableComponent } from './../../components/tabbed-table/tabbed-table.component'
import { AmountConverterPipe } from './../../pipes/amount-converter/amount-converter.pipe'
import { BlockDetailComponent } from './block-detail.component'
import { BlockDetailWrapperComponent } from 'src/app/components/block-detail-wrapper/block-detail-wrapper.component'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from 'src/app/components/tezblock-table/amount-cell/amount-cell.component'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { TooltipItemComponent } from 'src/app/components/tooltip-item/tooltip-item.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

describe('BlockDetailComponent', () => {
  let component: BlockDetailComponent
  let fixture: ComponentFixture<BlockDetailComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe, TabsetConfig, { provide: Actions, useValue: EMPTY }],
        imports: [FontAwesomeModule, MomentModule, CollapseModule, TabsModule, BrowserAnimationsModule, PaginationModule],
        declarations: [
          BlockDetailComponent,
          IdenticonComponent,
          AddressItemComponent,
          AmountCellComponent,
          AddressCellComponent,
          BlockCellComponent,
          TabbedTableComponent,
          TezblockTable2Component,
          BlockDetailWrapperComponent,
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
    fixture = TestBed.createComponent(BlockDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })
})
