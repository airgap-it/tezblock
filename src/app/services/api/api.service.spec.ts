import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { ApiService } from './api.service'

describe('ApiService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })
  it('should be created', () => {
    const service: ApiService = TestBed.get(ApiService)
    expect(service).toBeTruthy()
  })
})
