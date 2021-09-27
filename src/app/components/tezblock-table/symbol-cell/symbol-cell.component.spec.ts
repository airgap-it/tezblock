import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SymbolCellComponent } from './symbol-cell.component';

describe('SymbolCellComponent', () => {
  let component: SymbolCellComponent;
  let fixture: ComponentFixture<SymbolCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [SymbolCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(SymbolCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
