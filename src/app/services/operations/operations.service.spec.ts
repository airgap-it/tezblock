import { TestBed } from '@angular/core/testing'

import { OperationsService } from './operations.service'

describe('OperationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: OperationsService = TestBed.get(OperationsService)
    expect(service).toBeTruthy()
  })
})
