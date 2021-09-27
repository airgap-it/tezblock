import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EcosystemFilterPipe } from '@tezblock/pipes/ecosystem-filter/ecosystem-filter.pipe';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { getPipeMock } from 'test-config/mocks/pipe.mock';

import { DappsComponent } from './dapps.component';

describe('DappsComponent', () => {
  let component: DappsComponent;
  let fixture: ComponentFixture<DappsComponent>;
  const ecosystemPipeMock = getPipeMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DappsComponent, TranslatePipe, EcosystemFilterPipe],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
        { provide: EcosystemFilterPipe, useValue: ecosystemPipeMock },
      ],
    }).compileComponents();
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
