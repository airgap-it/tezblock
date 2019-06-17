import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HashCellComponent } from './hash-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('HashCellComponent', () => {
  let component: HashCellComponent
  let fixture: ComponentFixture<HashCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [HashCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(HashCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
