import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TooltipModule } from 'ngx-bootstrap'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { Store } from '@ngrx/store'

import { ProposalDetailComponent } from './proposal-detail.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { storeMock } from 'test-config/mocks'

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent
  let fixture: ComponentFixture<ProposalDetailComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [FontAwesomeModule, TooltipModule.forRoot()],
        declarations: [ProposalDetailComponent],
        providers: [{ provide: Store, useValue: storeMock }]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
