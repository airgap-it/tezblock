import { TestBed } from '@angular/core/testing'

import { OperationsService } from './operations.service'

xdescribe('OperationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: OperationsService = TestBed.inject(OperationsService)
    expect(service).toBeTruthy()
  })
})
