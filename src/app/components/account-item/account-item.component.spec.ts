import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { AccountItemComponent } from './account-item.component'

xdescribe('AccountItemComponent', () => {
  let component: AccountItemComponent
  let fixture: ComponentFixture<AccountItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [AccountItemComponent]
      })
    )

      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
