import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { BaseChartDirective } from 'ng2-charts'
import { AlertConfig, AlertModule, TooltipConfig, TooltipModule } from 'ngx-bootstrap'
import { ModalModule } from 'ngx-bootstrap/modal'
import { ProgressbarConfig, ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { TypeaheadConfig, TypeaheadModule } from 'ngx-bootstrap/typeahead'
import { MomentModule } from 'ngx-moment'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { UnitHelper } from 'test-config/unit-test-helper'

import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { BlockItemComponent } from './../../components/block-item/block-item.component'
import { PricechartItemComponent } from './../../components/pricechart-item/pricechart-item.component'
import { TransactionItemComponent } from './../../components/transaction-item/transaction-item.component'
import { DashboardComponent } from './dashboard.component'

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AlertConfig, TypeaheadConfig, ProgressbarConfig, TooltipConfig],
        imports: [FontAwesomeModule, ProgressbarModule, MomentModule, TooltipModule, AlertModule, TypeaheadModule, ModalModule.forRoot()],
        declarations: [
          PricechartItemComponent,
          BlockItemComponent,
          TransactionItemComponent,
          IdenticonComponent,
          BaseChartDirective,
          AddressItemComponent,
          DashboardComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
