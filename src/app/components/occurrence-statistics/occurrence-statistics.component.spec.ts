import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { OccurrenceStatisticsComponent } from './occurrence-statistics.component';

describe('OccurrenceStatisticsComponent', () => {
  let component: OccurrenceStatisticsComponent;
  let fixture: ComponentFixture<OccurrenceStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [OccurrenceStatisticsComponent],
    });

    fixture = TestBed.createComponent(OccurrenceStatisticsComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
