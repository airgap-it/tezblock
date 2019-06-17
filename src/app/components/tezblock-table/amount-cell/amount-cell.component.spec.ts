import { CurrencySymbolPipe } from './../../../pipes/currency-symbol/currency-symbol.pipe'
import { CurrencyConverterPipe } from './../../../pipes/currency-converter/currency-converter.pipe'
import { AmountConverterPipe } from './../../../pipes/amount-converter/amount-converter.pipe'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AmountCellComponent } from './amount-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('AmountCellComponent', () => {
  let component: AmountCellComponent
  let fixture: ComponentFixture<AmountCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe],
        declarations: [AmountCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(AmountCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
