import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BlockDetailWrapperComponent } from './block-detail-wrapper.component'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MomentModule } from 'ngx-moment'
import { AddressItemComponent } from '../address-item/address-item.component'
import { CollapseModule } from 'ngx-bootstrap'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AmountConverterPipe } from 'src/app/pipes/amount-converter/amount-converter.pipe'
import { UnitHelper } from 'test-config/unit-test-helper'
import { IdenticonComponent } from '../identicon/identicon'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'

describe('BlockDetailWrapperComponent', () => {
  let component: BlockDetailWrapperComponent
  let fixture: ComponentFixture<BlockDetailWrapperComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [AmountConverterPipe],
        imports: [FontAwesomeModule, MomentModule, CollapseModule, BrowserAnimationsModule],
        declarations: [IdenticonComponent, AddressItemComponent, BlockDetailWrapperComponent, LoadingSkeletonComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(BlockDetailWrapperComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
