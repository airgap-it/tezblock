import { TestBed } from '@angular/core/testing'
import { BlockSingleService } from './block-single.service'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('BlockSingleService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error)
  })
  it('should be created', () => {
    const service: BlockSingleService = TestBed.inject(BlockSingleService)
    expect(service).toBeTruthy()
  })
})
