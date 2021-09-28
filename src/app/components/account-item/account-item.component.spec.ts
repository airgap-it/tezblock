import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { AccountItemComponent } from './account-item.component';

describe('AccountItemComponent', () => {
  let component: AccountItemComponent;
  let fixture: ComponentFixture<AccountItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [],
      declarations: [AccountItemComponent],
    });

    fixture = TestBed.createComponent(AccountItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
