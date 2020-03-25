import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionErrorsComponent } from './transaction-errors.component';

describe('TransactionErrorsComponent', () => {
  let component: TransactionErrorsComponent;
  let fixture: ComponentFixture<TransactionErrorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionErrorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
