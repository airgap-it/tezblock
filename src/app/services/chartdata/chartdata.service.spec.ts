import { ChartDataService } from './chartdata.service'
import { TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

describe('ChartDataService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: ChartDataService = TestBed.inject(ChartDataService)
    expect(service).toBeTruthy()
  })
})
