import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { BaseChartDirective } from 'ng2-charts'
import { AlertConfig, AlertModule } from 'ngx-bootstrap/alert'
import { TooltipConfig, TooltipModule } from 'ngx-bootstrap/tooltip'
import { ModalModule } from 'ngx-bootstrap/modal'
import { ProgressbarConfig, ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { TypeaheadConfig, TypeaheadModule } from 'ngx-bootstrap/typeahead'
import { MomentModule } from 'ngx-moment'

import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { BlockItemComponent } from './../../components/block-item/block-item.component'
import { ChartItemComponent } from '../../components/chart-item/chart-item.component'
import { TransactionItemComponent } from './../../components/transaction-item/transaction-item.component'
import { DashboardComponent } from './dashboard.component'
import { SearchItemComponent } from '@tezblock/components/search-item/search-item.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock'
import { ApiService } from '@tezblock/services/api/api.service'

xdescribe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          AlertConfig,
          TypeaheadConfig,
          ProgressbarConfig,
          TooltipConfig,
          IconPipe,
          { provide: ApiService, useValue: getApiServiceMock() }
        ],
        imports: [FontAwesomeModule, ProgressbarModule, MomentModule, TooltipModule, AlertModule, TypeaheadModule, ModalModule.forRoot()],
        declarations: [
          ChartItemComponent,
          BlockItemComponent,
          TransactionItemComponent,
          IdenticonComponent,
          BaseChartDirective,
          AddressItemComponent,
          DashboardComponent,
          SearchItemComponent
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
