import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlainValueCellComponent } from './plain-value-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('PlainValueCellComponent', () => {
  let component: PlainValueCellComponent
  let fixture: ComponentFixture<PlainValueCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [PlainValueCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(PlainValueCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
