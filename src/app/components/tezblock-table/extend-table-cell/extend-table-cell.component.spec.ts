import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IconPipe } from 'src/app/pipes/icon/icon.pipe';
import { ExtendTableCellComponent } from './extend-table-cell.component';

describe('ExtendTableCellComponent', () => {
  let component: ExtendTableCellComponent;
  let fixture: ComponentFixture<ExtendTableCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IconPipe],
      imports: [FontAwesomeModule],
      declarations: [ExtendTableCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(ExtendTableCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
