import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

import { TokenContractOverviewComponent } from './token-contract-overview.component'
import { initialState as tcoInitialState } from './reducer'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('TokenContractOverviewComponent', () => {
  let component: TokenContractOverviewComponent
  let fixture: ComponentFixture<TokenContractOverviewComponent>
  const initialState = { tokenContractOveview: tcoInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenContractOverviewComponent, TranslatePipe],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(TokenContractOverviewComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
