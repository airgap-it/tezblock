import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestContractsTransactionsComponent } from './latest-contracts-transactions.component';

describe('LatestContractTransactionsComponent', () => {
  let component: LatestContractsTransactionsComponent;
  let fixture: ComponentFixture<LatestContractsTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestContractsTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestContractsTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
