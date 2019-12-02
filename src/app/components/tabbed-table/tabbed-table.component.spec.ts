import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { EMPTY } from 'rxjs'

import { AddressItemComponent } from 'src/app/components/address-item/address-item.component'
import { AddressCellComponent } from './../tezblock-table/address-cell/address-cell.component'
import { TezblockTableComponent } from './../tezblock-table/tezblock-table.component'
import { TabbedTableComponent } from './tabbed-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from '../tezblock-table/amount-cell/amount-cell.component'
import { IdenticonComponent } from '../identicon/identicon'

describe('TabbedTableComponent', () => {
  let component: TabbedTableComponent
  let fixture: ComponentFixture<TabbedTableComponent>
  let transactionSingleServiceMock = jasmine.createSpyObj('TransactionSingleService', ['loadMore'])
  transactionSingleServiceMock.actionType$ = EMPTY

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [TabsModule, FontAwesomeModule],
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
    component.dataService = transactionSingleServiceMock
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
