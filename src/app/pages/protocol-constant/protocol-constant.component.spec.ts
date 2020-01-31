import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProtocolConstantComponent } from './protocol-constant.component'

describe('ProtocolConstantComponent', () => {
  let component: ProtocolConstantComponent
  let fixture: ComponentFixture<ProtocolConstantComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolConstantComponent]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolConstantComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
