import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SymbolCellComponent } from './symbol-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'

xdescribe('SymbolCellComponent', () => {
  let component: SymbolCellComponent
  let fixture: ComponentFixture<SymbolCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [SymbolCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(SymbolCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
