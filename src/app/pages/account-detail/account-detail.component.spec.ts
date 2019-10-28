import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ModalModule, TabsetConfig, TabsModule, TooltipModule } from 'ngx-bootstrap'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { TezblockTableComponent } from 'src/app/components/tezblock-table/tezblock-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'

import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { TabbedTableComponent } from './../../components/tabbed-table/tabbed-table.component'
import { AmountConverterPipe } from './../../pipes/amount-converter/amount-converter.pipe'
import { AccountDetailComponent } from './account-detail.component'
import { BakerTableComponent } from './../../components/baker-table/baker-table.component'
import { ToastrModule, ToastrService } from 'ngx-toastr'
import { MomentModule } from 'ngx-moment'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent
  let fixture: ComponentFixture<AccountDetailComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe, BsModalService, TabsetConfig, ToastrService, IconPipe],
        imports: [
          ProgressbarModule,
          TooltipModule,
          FontAwesomeModule,
          TabsModule,
          ModalModule.forRoot(),
          ToastrModule.forRoot(),
          MomentModule
        ],
        declarations: [
          AccountDetailComponent,
          BakerTableComponent,
          IdenticonComponent,
          AddressItemComponent,
          TabbedTableComponent,
          TezblockTableComponent,
          LoadingSkeletonComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(AccountDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
