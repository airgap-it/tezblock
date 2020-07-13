import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { TransactionErrorsComponent } from './transaction-errors.component'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { getPipeMock } from 'test-config/mocks/pipe.mock'

describe('TransactionErrorsComponent', () => {
  let component: TransactionErrorsComponent
  let fixture: ComponentFixture<TransactionErrorsComponent>
  const amountConverterPipeMock = getPipeMock()

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionErrorsComponent],
      providers: [{ provide: AmountConverterPipe, useValue: amountConverterPipeMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(TransactionErrorsComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
