import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'

import { TooltipItemComponent } from './tooltip-item.component'

describe('TooltipItemComponent', () => {
  let component: TooltipItemComponent
  let fixture: ComponentFixture<TooltipItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [IconPipe],
        imports: [FontAwesomeModule, TooltipModule.forRoot()],
        declarations: [TooltipItemComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
