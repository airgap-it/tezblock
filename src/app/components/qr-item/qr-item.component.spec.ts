import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';

import { QrItemComponent } from './qr-item.component';
import { CopyService } from 'src/app/services/copy/copy.service';
import { getCopyServiceMock } from 'src/app/services/copy/copy.service.mock';

describe('QrItemComponent', () => {
  let component: QrItemComponent;
  let fixture: ComponentFixture<QrItemComponent>;
  const copyServiceMock = getCopyServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QRCodeModule],
      declarations: [QrItemComponent],
      providers: [{ provide: CopyService, useValue: copyServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(QrItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
