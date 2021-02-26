import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { EcosystemItemComponent } from './ecosystem-item.component'
import { EcosystemCategory, EcosystemItem } from '@tezblock/interfaces/Ecosystem'
import { TranslateService, TranslateModule, TranslatePipe } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('ResourcesWalletItemComponent', () => {
  let component: EcosystemItemComponent
  let fixture: ComponentFixture<EcosystemItemComponent>
  let mockedWallet: EcosystemItem

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FontAwesomeModule, TranslateModule.forRoot()],
      declarations: [EcosystemItemComponent, TranslatePipe],
      providers: [
        IconPipe,
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(EcosystemItemComponent)
    component = fixture.componentInstance
    component.ecosystem = mockedWallet

    mockedWallet = {
      title: 'fooTitle',
      description: `fooDescription`,
      logo: 'galleon.png',
      socials: [],
      platforms: [],
      features: [],
      downloadLink: 'fooDownloadLink',
      category: EcosystemCategory.wallet
    }
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
