import { TestBed } from '@angular/core/testing'

import { AliasService } from './alias.service'
import { UnitHelper } from 'test-config/unit-test-helper'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'

describe('AliasService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [ShortenStringPipe], imports: [], declarations: [] }))
      .compileComponents()
      .catch(console.error)
  })
  it('should be created', () => {
    const service: AliasService = TestBed.get(AliasService)
    expect(service).toBeTruthy()
  })
})
