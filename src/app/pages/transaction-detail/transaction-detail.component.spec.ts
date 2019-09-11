import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { BsModalService, ModalModule, TabsetConfig, TabsModule, TooltipModule } from 'ngx-bootstrap'
import { MomentModule } from 'ngx-moment'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { TabbedTableComponent } from 'src/app/components/tabbed-table/tabbed-table.component'
import { TezblockTableComponent } from 'src/app/components/tezblock-table/tezblock-table.component'
import { TransactionItemComponent } from 'src/app/components/transaction-item/transaction-item.component'
import { UnitHelper } from 'test-config/unit-test-helper'

import { ToastrModule, ToastrService } from 'ngx-toastr'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'
import { TransactionDetailWrapperComponent } from 'src/app/components/transaction-detail-wrapper/transaction-detail-wrapper.component'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { AmountConverterPipe } from './../../pipes/amount-converter/amount-converter.pipe'
import { TransactionDetailComponent } from './transaction-detail.component'

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent
  let fixture: ComponentFixture<TransactionDetailComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe, TabsetConfig, BsModalService, ToastrService],
        imports: [MomentModule, FontAwesomeModule, TabsModule, TooltipModule, ModalModule.forRoot(), ToastrModule.forRoot()],
        declarations: [
          TransactionDetailComponent,
          TabbedTableComponent,
          TezblockTableComponent,
          TransactionItemComponent,
          AddressItemComponent,
          IdenticonComponent,
          TransactionDetailWrapperComponent,
          LoadingSkeletonComponent
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(TransactionDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
