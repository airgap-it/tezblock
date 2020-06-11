import { TestBed } from '@angular/core/testing'

import { BeaconService } from './beacon.service'

describe('BeaconService', () => {
  let service: BeaconService

  beforeEach(() => {
    TestBed.configureTestingModule({})

    service = TestBed.get(BeaconService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  // how to override es6 class import by mock ? ...
  // possible solution: https://www.npmjs.com/package/ts-mock-imports
})
