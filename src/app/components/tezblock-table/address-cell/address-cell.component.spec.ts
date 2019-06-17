import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from 'test-config/unit-test-helper'

import { IdenticonComponent } from '../../identicon/identicon'

import { AddressItemComponent } from './../../address-item/address-item.component'
import { AddressCellComponent } from './address-cell.component'

describe('AddressCellComponent', () => {
  let component: AddressCellComponent
  let fixture: ComponentFixture<AddressCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [AddressCellComponent, AddressItemComponent, IdenticonComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
