import { AddressCellComponent } from './address-cell/address-cell.component'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from '../address-item/address-item.component'
import { IdenticonComponent } from '../identicon/identicon'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from './amount-cell/amount-cell.component'
import { TezblockTableComponent } from './tezblock-table.component'
import { NgxPaginationModule } from 'ngx-pagination'

describe('TezblockTableComponent', () => {
  let component: TezblockTableComponent
  let fixture: ComponentFixture<TezblockTableComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [IconPipe, NgxPaginationModule],
        imports: [FontAwesomeModule, NgxPaginationModule],
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
