import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { BakingService } from './baking.service'

describe('BakerRatingService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: BakingService = TestBed.get(BakingService)
    expect(service).toBeTruthy()
  })
})
