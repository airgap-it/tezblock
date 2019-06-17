import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from 'test-config/unit-test-helper'

import { IdenticonComponent } from './../identicon/identicon'
import { AddressItemComponent } from './address-item.component'

describe('AddressItemComponent', () => {
  let component: AddressItemComponent
  let fixture: ComponentFixture<AddressItemComponent>
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddressItemComponent, IdenticonComponent]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
