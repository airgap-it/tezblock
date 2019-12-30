import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { ContractDetailComponent } from './contract-detail.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { IdenticonComponent } from '@tezblock/components/identicon/identicon'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

describe('ContractDetailComponent', () => {
  let component: ContractDetailComponent
  let fixture: ComponentFixture<ContractDetailComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [FontAwesomeModule],
        declarations: [ContractDetailComponent, AddressItemComponent, IdenticonComponent],
        providers: [IconPipe]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
