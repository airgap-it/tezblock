import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DappsComponent } from './dapps.component';

describe('DappsComponent', () => {
  let component: DappsComponent;
  let fixture: ComponentFixture<DappsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DappsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DappsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
