import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardsTableComponent } from './rewards-table.component';

describe('RewardsTableComponent', () => {
  let component: RewardsTableComponent;
  let fixture: ComponentFixture<RewardsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RewardsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
