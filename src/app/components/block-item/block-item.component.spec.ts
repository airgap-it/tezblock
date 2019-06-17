import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MomentModule } from 'ngx-moment'
import { UnitHelper } from 'test-config/unit-test-helper'

import { IdenticonComponent } from '../identicon/identicon'

import { AddressItemComponent } from './../address-item/address-item.component'
import { BlockItemComponent } from './block-item.component'

describe('ListItemComponent', () => {
  let component: BlockItemComponent
  let fixture: ComponentFixture<BlockItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [MomentModule],
        declarations: [BlockItemComponent, AddressItemComponent, IdenticonComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
