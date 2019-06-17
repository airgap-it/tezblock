import { BaseChartDirective } from 'ng2-charts'
import { CryptoPricesService } from './../../services/crypto-prices/crypto-prices.service'
import { PricechartItemComponent } from './pricechart-item.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

describe('PricechartItemComponent', () => {
  let component: PricechartItemComponent
  let fixture: ComponentFixture<PricechartItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [CryptoPricesService],
        declarations: [PricechartItemComponent, BaseChartDirective]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(PricechartItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
