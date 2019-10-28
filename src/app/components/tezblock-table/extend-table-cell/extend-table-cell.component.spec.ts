import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendTableCellComponent } from './extend-table-cell.component';

describe('ExtendTableCellComponent', () => {
  let component: ExtendTableCellComponent;
  let fixture: ComponentFixture<ExtendTableCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendTableCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendTableCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
