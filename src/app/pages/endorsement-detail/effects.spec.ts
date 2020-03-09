import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store'

import { UnitHelper } from 'test-config/unit-test-helper'
import { EndorsementDetailEffects } from './effects'

describe('AppEffects', () => {
  let actions$: Observable<any>
  let effects: EndorsementDetailEffects

  beforeEach(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          EndorsementDetailEffects, provideMockActions(() => actions$)
        ]
      })
    )

    effects = TestBed.inject<EndorsementDetailEffects>(EndorsementDetailEffects)
  })

  it('should be created', () => {
    expect(effects).toBeTruthy()
  })
})
