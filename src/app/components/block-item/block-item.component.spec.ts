import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { BlockItemComponent } from './block-item.component';

describe('BlockItemComponent', () => {
  let component: BlockItemComponent;
  let fixture: ComponentFixture<BlockItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [BlockItemComponent],
    });

    fixture = TestBed.createComponent(BlockItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
