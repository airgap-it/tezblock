import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { PaginationModule } from 'ngx-bootstrap/pagination'

import { ClientSideTableComponent } from './client-side-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('ClientSideTableComponent', () => {
  let component: ClientSideTableComponent
  let fixture: ComponentFixture<ClientSideTableComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [FontAwesomeModule, PaginationModule],
        declarations: [ClientSideTableComponent]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSideTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
