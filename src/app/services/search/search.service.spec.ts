import { TestBed } from '@angular/core/testing'

import { SearchService } from './search.service'
import { UnitHelper } from 'test-config/unit-test-helper'

xdescribe('SearchService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: SearchService = TestBed.inject(SearchService)
    expect(service).toBeTruthy()
  })
})
