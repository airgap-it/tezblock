import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ChartItemComponent } from './chart-item.component';

describe('ChartItemComponent', () => {
  let component: ChartItemComponent;
  let fixture: ComponentFixture<ChartItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ChartItemComponent],
    });

    fixture = TestBed.createComponent(ChartItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
