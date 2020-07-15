import { TestBed } from '@angular/core/testing'

import { LanguagesService } from './languages.service'
import { UnitHelper } from 'test-config/unit-test-helper'
import { TranslateService } from '@ngx-translate/core'

xdescribe('LanguagesService', () => {
  let unitHelper: UnitHelper

  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [TranslateService] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: LanguagesService = TestBed.get(LanguagesService)
    expect(service).toBeTruthy()
  })
})
