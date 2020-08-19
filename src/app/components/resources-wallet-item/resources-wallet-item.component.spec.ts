import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { ResourcesWalletItemComponent } from './resources-wallet-item.component'
import { Wallet } from '@tezblock/interfaces/Wallet'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'

describe('ResourcesWalletItemComponent', () => {
  let component: ResourcesWalletItemComponent
  let fixture: ComponentFixture<ResourcesWalletItemComponent>
  let mockedWallet: Wallet

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FontAwesomeModule, TranslateModule.forRoot()],
      declarations: [ResourcesWalletItemComponent],
      providers: [IconPipe, { provide: TranslateService, useClass: TranslateServiceStub }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ResourcesWalletItemComponent)
    component = fixture.componentInstance
    component.wallet = mockedWallet

    mockedWallet = {
      title: 'fooTitle',
      description: `fooDescription`,
      logo: 'galleon.png',
      socials: [],
      platforms: [],
      features: [],
      downloadLink: 'fooDownloadLink'
    }
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
