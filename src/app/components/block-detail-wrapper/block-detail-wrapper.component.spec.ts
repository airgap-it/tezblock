import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'

import { BlockDetailWrapperComponent } from './block-detail-wrapper.component'

xdescribe('BlockDetailWrapperComponent', () => {
  let component: BlockDetailWrapperComponent
  let fixture: ComponentFixture<BlockDetailWrapperComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      declarations: [BlockDetailWrapperComponent]
    })

    fixture = TestBed.createComponent(BlockDetailWrapperComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
