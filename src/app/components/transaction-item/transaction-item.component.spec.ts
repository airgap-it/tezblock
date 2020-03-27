import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { MomentModule } from 'ngx-moment'
import { ShortenStringPipe } from 'src/app/pipes/shorten-string/shorten-string.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'

import { AddressItemComponent } from './../address-item/address-item.component'
import { IdenticonComponent } from './../identicon/identicon'
import { TransactionItemComponent } from './transaction-item.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

describe('TransactionItemComponent', () => {
  let component: TransactionItemComponent
  let fixture: ComponentFixture<TransactionItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [ShortenStringPipe, IconPipe],
        imports: [MomentModule, TooltipModule, FontAwesomeModule],
        declarations: [TransactionItemComponent, AddressItemComponent, IdenticonComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
