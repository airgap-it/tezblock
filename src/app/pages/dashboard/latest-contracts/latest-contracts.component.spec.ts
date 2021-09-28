import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LatestContractsComponent } from './latest-contracts.component';

describe('LatestContractsComponent', () => {
  let component: LatestContractsComponent;
  let fixture: ComponentFixture<LatestContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [LatestContractsComponent],
    });

    fixture = TestBed.createComponent(LatestContractsComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
