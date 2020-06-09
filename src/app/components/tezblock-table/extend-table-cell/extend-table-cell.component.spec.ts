import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'

import { ExtendTableCellComponent } from './extend-table-cell.component'

xdescribe('ExtendTableCellComponent', () => {
  let component: ExtendTableCellComponent
  let fixture: ComponentFixture<ExtendTableCellComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [IconPipe],
        imports: [FontAwesomeModule],
        declarations: [ExtendTableCellComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(ExtendTableCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendTableCellComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
