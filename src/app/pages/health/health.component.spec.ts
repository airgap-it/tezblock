import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { HealthComponent } from './health.component'
import { initialState as hInitialState } from './reducer'

describe('HealthComponent', () => {
  let component: HealthComponent
  let fixture: ComponentFixture<HealthComponent>
  const initialState = { health: hInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HealthComponent],
      providers: [provideMockStore({ initialState })],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(HealthComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
