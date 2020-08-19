import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal'

import { TransactionDetailWrapperComponent } from './transaction-detail-wrapper.component'
import { AmountConverterPipe } from 'src/app/pipes/amount-converter/amount-converter.pipe'
import { MomentModule } from 'ngx-moment'
import { ToastrModule, ToastrService } from 'ngx-toastr'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'

describe('TransactionDetailWrapperComponent', () => {
  let component: TransactionDetailWrapperComponent
  let fixture: ComponentFixture<TransactionDetailWrapperComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AmountConverterPipe,
        BsModalService,
        ToastrService,
        IconPipe,
        { provide: TranslateService, useClass: TranslateServiceStub }
      ],
      imports: [
        FontAwesomeModule,
        MomentModule,
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        TranslateModule.forRoot()
      ],
      declarations: [TransactionDetailWrapperComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(TransactionDetailWrapperComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
