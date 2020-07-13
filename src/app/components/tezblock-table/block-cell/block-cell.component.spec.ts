import { BlockCellComponent } from './block-cell.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('BlockCellComponent', () => {
  let component: BlockCellComponent
  let fixture: ComponentFixture<BlockCellComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [BlockCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(BlockCellComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
