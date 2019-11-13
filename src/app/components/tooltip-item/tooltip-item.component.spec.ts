import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipItemComponent } from './tooltip-item.component';

describe('TooltipItemComponent', () => {
  let component: TooltipItemComponent;
  let fixture: ComponentFixture<TooltipItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TooltipItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
