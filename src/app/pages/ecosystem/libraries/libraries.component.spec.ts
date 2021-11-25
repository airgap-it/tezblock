import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EcosystemItemComponent } from '@tezblock/components/ecosystem-item/ecosystem-item.component';
import { EcosystemFilterPipe } from '@tezblock/pipes/ecosystem-filter/ecosystem-filter.pipe';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { getPipeMock } from 'test-config/mocks/pipe.mock';

import { LibrariesComponent } from './libraries.component';

describe('LibrariesComponent', () => {
  let component: LibrariesComponent;
  let fixture: ComponentFixture<LibrariesComponent>;
  const ecosystemPipeMock = getPipeMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LibrariesComponent,
        TranslatePipe,
        EcosystemFilterPipe,
        EcosystemItemComponent,
        IconPipe,
      ],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
        { provide: EcosystemFilterPipe, useValue: ecosystemPipeMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
