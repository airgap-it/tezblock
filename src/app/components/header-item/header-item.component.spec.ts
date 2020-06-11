import { SearchService } from './../../services/search/search.service'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { HeaderItemComponent } from './header-item.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

xdescribe('HeaderItemComponent', () => {
  let component: HeaderItemComponent
  let fixture: ComponentFixture<HeaderItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [SearchService],
        imports: [FontAwesomeModule],
        declarations: [HeaderItemComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
