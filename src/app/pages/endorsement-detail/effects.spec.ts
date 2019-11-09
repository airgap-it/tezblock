import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { EndorsementDetailEffects } from './effects';

describe('AppEffects', () => {
  let actions$: Observable<any>;
  let effects: EndorsementDetailEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EndorsementDetailEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<EndorsementDetailEffects>(EndorsementDetailEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
