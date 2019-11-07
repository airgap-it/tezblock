import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ModalModule } from 'ngx-bootstrap/modal'
import { BsModalService } from 'ngx-bootstrap'

import { ModalCellComponent } from './modal-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('ModalCellComponent', () => {
  let component: ModalCellComponent
  let fixture: ComponentFixture<ModalCellComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [BsModalService],
        imports: [ModalModule.forRoot(), FontAwesomeModule],
        declarations: [ModalCellComponent]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
