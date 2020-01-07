import { BaseChartDirective } from 'ng2-charts'
import { CryptoPricesService } from '../../services/crypto-prices/crypto-prices.service'
import { AreaChartItemComponent } from './area-chart-item.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

describe('AreaChartItemComponent', () => {
  let component: AreaChartItemComponent
  let fixture: ComponentFixture<AreaChartItemComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [CryptoPricesService],
        declarations: [AreaChartItemComponent, BaseChartDirective]
      })
    )
      .compileComponents()
      .catch(console.error)
    fixture = TestBed.createComponent(AreaChartItemComponent)
    component = fixture.componentInstance
    component.datasets = [{ data: [], label: null }]
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
