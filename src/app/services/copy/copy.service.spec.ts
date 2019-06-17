import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { CopyService } from './copy.service'

describe('CopyService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })
  it('should be created', () => {
    const service: CopyService = TestBed.get(CopyService)
    expect(service).toBeTruthy()
  })
})
