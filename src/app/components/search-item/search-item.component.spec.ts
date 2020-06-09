import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadModule } from 'ngx-bootstrap/typeahead'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { SearchItemComponent } from './search-item.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { ApiService } from '@tezblock/services/api/api.service'
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock'
import { SearchService } from 'src/app/services/search/search.service'
import { of } from 'rxjs'

xdescribe('SearchItemComponent', () => {
  let component: SearchItemComponent
  let fixture: ComponentFixture<SearchItemComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()
    const SearchServiceMock = jasmine.createSpyObj('SearchService', {
      search: of(false)
    })

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [TypeaheadModule.forRoot(), FontAwesomeModule],
        declarations: [SearchItemComponent],
        providers: [
          { provide: ApiService, useValue: getApiServiceMock() },
          { provide: SearchService, useValue: SearchServiceMock }
        ]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
