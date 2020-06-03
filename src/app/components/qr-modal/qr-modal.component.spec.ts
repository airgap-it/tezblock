import { QrItemComponent } from './../qr-item/qr-item.component'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { AddressItemComponent } from './../address-item/address-item.component'
import { IdenticonComponent } from './../identicon/identicon'
import { QrModalComponent } from './qr-modal.component'

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from 'test-config/unit-test-helper'

xdescribe('QrModalComponent', () => {
  let component: QrModalComponent
  let fixture: ComponentFixture<QrModalComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        imports: [FontAwesomeModule],
        declarations: [QrModalComponent, IdenticonComponent, AddressItemComponent, QrItemComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(QrModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
