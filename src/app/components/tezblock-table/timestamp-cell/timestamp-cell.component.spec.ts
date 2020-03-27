import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TimestampCellComponent } from './timestamp-cell.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { MomentModule } from 'ngx-moment'

describe('TimestampCellComponent', () => {
  let component: TimestampCellComponent
  let fixture: ComponentFixture<TimestampCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [MomentModule, TooltipModule.forRoot()],
        declarations: [TimestampCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TimestampCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
