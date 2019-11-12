import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store'

import { UnitHelper } from 'test-config/unit-test-helper'
import { EndorsementDetailEffects } from './effects'

describe('AppEffects', () => {
  let actions$: Observable<any>
  let effects: EndorsementDetailEffects
  let storeMock;

  beforeEach(() => {
    const unitHelper = new UnitHelper()

    storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch'])

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          EndorsementDetailEffects, provideMockActions(() => actions$),
          { provide: Store, useValue: storeMock }
        ]
      })
    )

    effects = TestBed.get<EndorsementDetailEffects>(EndorsementDetailEffects)
  })

  it('should be created', () => {
    expect(effects).toBeTruthy()
  })
})
