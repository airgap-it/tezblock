import { TestBed } from '@angular/core/testing';

import { TableDefinitionService } from './table-definition.service';

describe('TableDefinitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TableDefinitionService = TestBed.get(TableDefinitionService);
    expect(service).toBeTruthy();
  });
});
