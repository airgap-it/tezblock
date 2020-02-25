import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestContractsComponent } from './latest-contracts.component';

xdescribe('LatestContractsComponent', () => {
  let component: LatestContractsComponent;
  let fixture: ComponentFixture<LatestContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestContractsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
