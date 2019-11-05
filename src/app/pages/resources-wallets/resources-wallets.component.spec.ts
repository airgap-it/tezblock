import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { ResourcesWalletsComponent } from './resources-wallets.component'
import { ResourcesWalletItemComponent } from "../../components/resources-wallet-item/resources-wallet-item.component";
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'

describe('ResourcesWalletsComponent', () => {
  let component: ResourcesWalletsComponent
  let fixture: ComponentFixture<ResourcesWalletsComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [IconPipe],
        imports: [FontAwesomeModule],
        declarations: [
          ResourcesWalletItemComponent,
          ResourcesWalletsComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(ResourcesWalletsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesWalletsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
