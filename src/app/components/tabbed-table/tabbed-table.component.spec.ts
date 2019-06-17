import { TabsModule } from 'ngx-bootstrap/tabs'
import { TezblockTableComponent } from './../tezblock-table/tezblock-table.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TabbedTableComponent } from './tabbed-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'

describe('TabbedTableComponent', () => {
  let component: TabbedTableComponent
  let fixture: ComponentFixture<TabbedTableComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [TabsModule, FontAwesomeModule],
        declarations: [TabbedTableComponent, TezblockTableComponent, LoadingSkeletonComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TabbedTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
