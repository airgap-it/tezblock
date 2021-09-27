import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCellComponent } from './basic-cell.component';

describe('BasicCellComponent', () => {
  let component: BasicCellComponent;
  let fixture: ComponentFixture<BasicCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BasicCellComponent],
    });

    fixture = TestBed.createComponent(BasicCellComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
