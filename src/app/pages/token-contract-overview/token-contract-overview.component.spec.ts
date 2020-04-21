import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TokenContractOverviewComponent } from './token-contract-overview.component'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('TokenContractOverviewComponent', () => {
  let component: TokenContractOverviewComponent
  let fixture: ComponentFixture<TokenContractOverviewComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [TokenContractOverviewComponent]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenContractOverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
