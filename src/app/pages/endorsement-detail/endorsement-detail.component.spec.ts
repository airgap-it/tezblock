import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndorsementDetailComponent } from './endorsement-detail.component';

describe('EndorsementDetailComponent', () => {
  let component: EndorsementDetailComponent;
  let fixture: ComponentFixture<EndorsementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndorsementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndorsementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
