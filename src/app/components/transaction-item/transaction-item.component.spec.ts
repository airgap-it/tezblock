import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MomentModule } from 'ngx-moment';
import { RouterTestingModule } from '@angular/router/testing';

import { ShortenStringPipe } from 'src/app/pipes/shorten-string/shorten-string.pipe';
import { TransactionItemComponent } from './transaction-item.component';
import { IconPipe } from 'src/app/pipes/icon/icon.pipe';

describe('TransactionItemComponent', () => {
  let component: TransactionItemComponent;
  let fixture: ComponentFixture<TransactionItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShortenStringPipe, IconPipe],
      imports: [
        MomentModule,
        TooltipModule,
        FontAwesomeModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [TransactionItemComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(TransactionItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
