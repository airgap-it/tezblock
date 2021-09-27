import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { WalletsComponent } from './wallets.component';
import { IconPipe } from 'src/app/pipes/icon/icon.pipe';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';
import { EcosystemFilterPipe } from '@tezblock/pipes/ecosystem-filter/ecosystem-filter.pipe';
import { getPipeMock } from 'test-config/mocks/pipe.mock';

describe('ResourcesWalletsComponent', () => {
  let component: WalletsComponent;
  let fixture: ComponentFixture<WalletsComponent>;
  const iconPipeMock = getPipeMock();
  const ecosystemPipeMock = getPipeMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IconPipe,
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
        { provide: EcosystemFilterPipe, useValue: ecosystemPipeMock },
        { provide: IconPipe, useValue: iconPipeMock },
      ],
      imports: [FontAwesomeModule],
      declarations: [
        WalletsComponent,
        TranslatePipe,
        IconPipe,
        EcosystemFilterPipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(WalletsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
