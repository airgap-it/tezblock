import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { HealthComponent } from './health.component'
import { initialState as hInitialState } from './reducer'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('HealthComponent', () => {
  let component: HealthComponent
  let fixture: ComponentFixture<HealthComponent>
  const initialState = { health: hInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HealthComponent, TranslatePipe],
      providers: [
        provideMockStore({ initialState }),
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(HealthComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
