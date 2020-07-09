import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { provideMockStore, MockStore } from '@ngrx/store/testing'

import { AmountCellComponent } from './amount-cell.component'
import { CurrencyConverterPipe } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { getPipeMock } from 'test-config/mocks/pipe.mock'
import { initialState as appInitialState } from '@tezblock/app.reducer'

describe('AmountCellComponent', () => {
  let component: AmountCellComponent
  let fixture: ComponentFixture<AmountCellComponent>
  const initialState = { app: appInitialState }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AmountCellComponent],
      providers: [provideMockStore({ initialState }), CurrencyConverterPipe, AmountConverterPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(AmountCellComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
