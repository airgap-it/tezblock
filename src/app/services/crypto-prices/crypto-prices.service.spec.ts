import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { CryptoPricesService } from './crypto-prices.service'

describe('CryptoPricesService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })
  it('should be created', () => {
    const service: CryptoPricesService = TestBed.get(CryptoPricesService)
    expect(service).toBeTruthy()
  })
})
