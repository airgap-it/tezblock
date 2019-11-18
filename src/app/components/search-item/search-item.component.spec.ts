import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TypeaheadModule } from 'ngx-bootstrap/typeahead'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { SearchItemComponent } from './search-item.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { ApiServiceMock } from 'test-config/mocks'
import { ApiService } from '@tezblock/services/api/api.service'

describe('SearchItemComponent', () => {
  let component: SearchItemComponent
  let fixture: ComponentFixture<SearchItemComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [TypeaheadModule.forRoot(), FontAwesomeModule],
        declarations: [SearchItemComponent],
        providers: [{ provide: ApiService, useValue: ApiServiceMock }]
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
