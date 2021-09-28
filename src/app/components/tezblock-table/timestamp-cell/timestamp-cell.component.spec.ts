import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TimestampCellComponent } from './timestamp-cell.component';
import { MomentModule } from 'ngx-moment';

describe('TimestampCellComponent', () => {
  let component: TimestampCellComponent;
  let fixture: ComponentFixture<TimestampCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      imports: [MomentModule, TooltipModule.forRoot()],
      declarations: [TimestampCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(TimestampCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
