import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsoredItemComponent } from './sponsored-item.component';

describe('SponsoredItemComponent', () => {
  let component: SponsoredItemComponent;
  let fixture: ComponentFixture<SponsoredItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SponsoredItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsoredItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
