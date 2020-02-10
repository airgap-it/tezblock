import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TooltipModule } from 'ngx-bootstrap'

import { HealthComponent } from './health.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { TimestampCellComponent } from '@tezblock/components/tezblock-table/timestamp-cell/timestamp-cell.component'

describe('HealthComponent', () => {
  let component: HealthComponent
  let fixture: ComponentFixture<HealthComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [TooltipModule.forRoot()],
        declarations: [TimestampCellComponent, HealthComponent]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
