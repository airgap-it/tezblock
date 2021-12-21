import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityInputComponent } from './liquidity-input.component';

describe('LiquidityInputComponent', () => {
  let component: LiquidityInputComponent;
  let fixture: ComponentFixture<LiquidityInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiquidityInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
