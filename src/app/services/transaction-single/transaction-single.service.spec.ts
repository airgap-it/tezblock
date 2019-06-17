import { TestBed } from '@angular/core/testing'

import { TransactionSingleService } from './transaction-single.service'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('TransactionSingleService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: TransactionSingleService = TestBed.get(TransactionSingleService)
    expect(service).toBeTruthy()
  })
})
