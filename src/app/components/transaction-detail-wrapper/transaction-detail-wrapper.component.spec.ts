import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UnitHelper } from 'test-config/unit-test-helper'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal'

import { TransactionDetailWrapperComponent } from './transaction-detail-wrapper.component'
import { AmountConverterPipe } from 'src/app/pipes/amount-converter/amount-converter.pipe'
import { MomentModule } from 'ngx-moment'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { ToastrModule, ToastrService } from 'ngx-toastr'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { TooltipItemComponent } from 'src/app/components/tooltip-item/tooltip-item.component'

xdescribe('TransactionDetailWrapperComponent', () => {
  let component: TransactionDetailWrapperComponent
  let fixture: ComponentFixture<TransactionDetailWrapperComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe, BsModalService, ToastrService, IconPipe],
        imports: [FontAwesomeModule, MomentModule, ModalModule.forRoot(), ToastrModule.forRoot(), TooltipModule.forRoot()],
        declarations: [TransactionDetailWrapperComponent, LoadingSkeletonComponent, TooltipItemComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDetailWrapperComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
