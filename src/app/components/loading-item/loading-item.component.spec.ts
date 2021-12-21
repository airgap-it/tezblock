import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingItemComponent } from './loading-item.component';

describe('LoadingItemComponent', () => {
  let component: LoadingItemComponent;
  let fixture: ComponentFixture<LoadingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
