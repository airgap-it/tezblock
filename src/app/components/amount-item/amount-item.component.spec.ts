import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountItemComponent } from './amount-item.component';

describe('AmountItemComponent', () => {
  let component: AmountItemComponent;
  let fixture: ComponentFixture<AmountItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmountItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
