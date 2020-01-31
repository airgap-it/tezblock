import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BakersComponent } from './bakers.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('BakersComponent', () => {
  let component: BakersComponent
  let fixture: ComponentFixture<BakersComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [BakersComponent]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BakersComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
