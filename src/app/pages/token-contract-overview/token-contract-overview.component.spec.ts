import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

import { TokenContractOverviewComponent } from './token-contract-overview.component'
import { initialState as tcoInitialState } from './reducer'

describe('TokenContractOverviewComponent', () => {
  let component: TokenContractOverviewComponent
  let fixture: ComponentFixture<TokenContractOverviewComponent>
  const initialState = { tokenContractOveview: tcoInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenContractOverviewComponent],
      providers: [provideMockStore({ initialState }), { provide: Actions, useValue: EMPTY }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(TokenContractOverviewComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
