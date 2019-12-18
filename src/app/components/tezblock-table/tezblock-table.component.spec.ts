import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { PaginationModule } from 'ngx-bootstrap/pagination'

import { AddressCellComponent } from './address-cell/address-cell.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from '../address-item/address-item.component'
import { IdenticonComponent } from '../identicon/identicon'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from './amount-cell/amount-cell.component'
import { TezblockTableComponent } from './tezblock-table.component'

describe('TezblockTableComponent', () => {
  let component: TezblockTableComponent
  let fixture: ComponentFixture<TezblockTableComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [IconPipe],
        imports: [FontAwesomeModule, PaginationModule],
        declarations: [
          TezblockTableComponent,
          LoadingSkeletonComponent,
          AddressCellComponent,
          AmountCellComponent,
          AddressItemComponent,
          IdenticonComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TezblockTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
