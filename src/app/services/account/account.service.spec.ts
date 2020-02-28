import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { AccountService } from './account.service'

describe('AccountService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: AccountService = TestBed.inject(AccountService)
    expect(service).toBeTruthy()
  })
})
