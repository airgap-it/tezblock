import { AddressCellComponent } from './address-cell/address-cell.component'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TezblockTableComponent } from './tezblock-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from './amount-cell/amount-cell.component'
import { AddressItemComponent } from '../address-item/address-item.component'
import { IdenticonComponent } from '../identicon/identicon'

describe('TezblockTableComponent', () => {
  let component: TezblockTableComponent
  let fixture: ComponentFixture<TezblockTableComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
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
