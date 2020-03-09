import { TestBed } from '@angular/core/testing'

import { UnitHelper } from 'test-config/unit-test-helper'

import { RewardSingleService } from './reward-single.service'

describe('RewardSingleService', () => {
  let unitHelper: UnitHelper
  
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: RewardSingleService = TestBed.inject(RewardSingleService)
    expect(service).toBeTruthy()
  })
})
