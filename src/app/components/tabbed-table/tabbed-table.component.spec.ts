import { AddressItemComponent } from 'src/app/components/address-item/address-item.component'
import { AddressCellComponent } from './../tezblock-table/address-cell/address-cell.component'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { TezblockTableComponent } from './../tezblock-table/tezblock-table.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TabbedTableComponent } from './tabbed-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from '../tezblock-table/amount-cell/amount-cell.component'
import { IdenticonComponent } from '../identicon/identicon'
import { PaginationModule } from 'ngx-bootstrap/pagination'

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
          AddressItemComponent
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
