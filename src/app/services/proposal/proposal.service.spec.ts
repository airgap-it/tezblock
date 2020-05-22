import { TestBed } from '@angular/core/testing'

import { ProposalService } from './proposal.service'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('ProposalService', () => {
  beforeEach(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({}))
  })

  it('should be created', () => {
    const service: ProposalService = TestBed.get(ProposalService)
    expect(service).toBeTruthy()
  })
})
