import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

import { TooltipItemComponent } from './tooltip-item.component'

describe('TooltipItemComponent', () => {
  let component: TooltipItemComponent
  let fixture: ComponentFixture<TooltipItemComponent>

  beforeEach(() => {
    TestBed.configureTestingModule(
      {
        providers: [IconPipe],
        imports: [FontAwesomeModule, TooltipModule.forRoot()],
        declarations: [TooltipItemComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }
    )

    fixture = TestBed.createComponent(TooltipItemComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
