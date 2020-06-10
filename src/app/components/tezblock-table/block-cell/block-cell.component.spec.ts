import { BlockCellComponent } from './block-cell.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from 'test-config/unit-test-helper'

xdescribe('BlockCellComponent', () => {
  let component: BlockCellComponent
  let fixture: ComponentFixture<BlockCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [BlockCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
