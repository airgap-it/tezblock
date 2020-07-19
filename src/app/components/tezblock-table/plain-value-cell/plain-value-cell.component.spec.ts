import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { PlainValueCellComponent } from './plain-value-cell.component'

describe('PlainValueCellComponent', () => {
  let component: PlainValueCellComponent
  let fixture: ComponentFixture<PlainValueCellComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [PlainValueCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(PlainValueCellComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
