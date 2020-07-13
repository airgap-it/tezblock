import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { HashCellComponent } from './hash-cell.component'

describe('HashCellComponent', () => {
  let component: HashCellComponent
  let fixture: ComponentFixture<HashCellComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [HashCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(HashCellComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
