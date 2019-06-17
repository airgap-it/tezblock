import { TestBed } from '@angular/core/testing'

import { TransactionService } from './transaction.service'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('TransactionService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })
  it('should be created', () => {
    const service: TransactionService = TestBed.get(TransactionService)
    expect(service).toBeTruthy()
  })
})
