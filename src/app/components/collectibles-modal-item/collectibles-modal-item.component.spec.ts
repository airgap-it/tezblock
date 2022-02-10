import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CollectiblesModalItemComponent } from './collectibles-modal-item.component';

describe('CollectiblesModalItemComponent', () => {
  let component: CollectiblesModalItemComponent;
  let fixture: ComponentFixture<CollectiblesModalItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectiblesModalItemComponent],
      providers: [BsModalRef],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectiblesModalItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
