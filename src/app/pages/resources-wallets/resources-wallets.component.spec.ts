import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { ResourcesWalletsComponent } from './resources-wallets.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('ResourcesWalletsComponent', () => {
  let component: ResourcesWalletsComponent
  let fixture: ComponentFixture<ResourcesWalletsComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IconPipe,
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock }
      ],
      imports: [FontAwesomeModule],
      declarations: [ResourcesWalletsComponent, TranslatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ResourcesWalletsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
