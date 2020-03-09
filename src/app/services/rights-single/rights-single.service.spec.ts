import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { RightsSingleService } from './rights-single.service'

describe('RightsSingleService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: RightsSingleService = TestBed.inject(RightsSingleService)
    expect(service).toBeTruthy()
  })
})
