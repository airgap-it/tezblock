import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesWalletsComponent } from './resources-wallets.component';

describe('ResourcesWalletsComponent', () => {
  let component: ResourcesWalletsComponent;
  let fixture: ComponentFixture<ResourcesWalletsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesWalletsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesWalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
