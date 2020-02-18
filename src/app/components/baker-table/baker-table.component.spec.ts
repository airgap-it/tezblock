import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { TabsModule, TabsetConfig } from 'ngx-bootstrap'
import { ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { ChartsModule } from 'ng2-charts'

import { AmountCellComponent } from './../tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { BakerTableComponent } from './baker-table.component'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { RightsSingleService } from './../../services/rights-single/rights-single.service'
import { AddressItemComponent } from '../address-item/address-item.component'
import { IdenticonComponent } from '../identicon/identicon'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { ClientSideTableComponent } from '@tezblock/components/client-side-table/client-side-table.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'

describe('BakerTableComponent', () => {
  let component: BakerTableComponent
  let fixture: ComponentFixture<BakerTableComponent>
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [RightsSingleService, TabsetConfig, IconPipe],
        imports: [ProgressbarModule, TabsModule, FontAwesomeModule, PaginationModule, ChartsModule],
        declarations: [
          BakerTableComponent,
          TezblockTableComponent,
          LoadingSkeletonComponent,
          IdenticonComponent,
          AmountCellComponent,
          BlockCellComponent,
          AddressItemComponent,
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
  })

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BakerTableComponent]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BakerTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
