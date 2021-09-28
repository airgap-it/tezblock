import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { QrModalComponent } from './qr-modal.component';
import { CopyService } from 'src/app/services/copy/copy.service';
import { getCopyServiceMock } from 'src/app/services/copy/copy.service.mock';
import { getBsModalRefMock } from 'test-config/mocks/bs-modal-ref.mock';
import { getToastrServiceMock } from 'test-config/mocks/toastr-service.mock';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';

describe('QrModalComponent', () => {
  let component: QrModalComponent;
  let fixture: ComponentFixture<QrModalComponent>;
  const copyServiceMock = getCopyServiceMock();
  const bsModalRefMock = getBsModalRefMock();
  const toastrServiceMock = getToastrServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QRCodeModule],
      declarations: [QrModalComponent, IconPipe],
      providers: [
        { provide: CopyService, useValue: copyServiceMock },
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: ToastrService, useValue: toastrServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(QrModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
