import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { ModalCellComponent } from './modal-cell.component'

describe('ModalCellComponent', () => {
  let component: ModalCellComponent
  let fixture: ComponentFixture<ModalCellComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [BsModalService],
      imports: [ModalModule.forRoot(), FontAwesomeModule],
      declarations: [ModalCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ModalCellComponent)
    component = fixture.componentInstance
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
