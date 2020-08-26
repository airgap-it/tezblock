import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { ProtocolConstantComponent } from './protocol-constant.component'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('ProtocolConstantComponent', () => {
  let component: ProtocolConstantComponent
  let fixture: ComponentFixture<ProtocolConstantComponent>
  let storeMock: MockStore<any>
  const initialState = { app: appInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolConstantComponent, TranslatePipe],
      providers: [
        provideMockStore({ initialState }),
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ProtocolConstantComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
