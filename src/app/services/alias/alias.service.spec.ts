import { TestBed } from '@angular/core/testing';

import { AliasService } from './alias.service';

describe('AliasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AliasService = TestBed.get(AliasService);
    expect(service).toBeTruthy();
  });
});
