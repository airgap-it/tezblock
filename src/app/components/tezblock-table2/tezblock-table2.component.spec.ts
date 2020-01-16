import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { PaginationModule } from 'ngx-bootstrap/pagination'

import { TezblockTable2Component } from './tezblock-table2.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('TezblockTable2Component', () => {
  let component: TezblockTable2Component
  let fixture: ComponentFixture<TezblockTable2Component>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [FontAwesomeModule, PaginationModule],
        declarations: [
          TezblockTable2Component
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TezblockTable2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
