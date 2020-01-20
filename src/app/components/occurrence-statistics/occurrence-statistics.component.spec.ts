import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { BaseChartDirective } from 'ng2-charts'

import { OccurrenceStatisticsComponent } from './occurrence-statistics.component'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'
import { ChartItemComponent } from '../chart-item/chart-item.component'

describe('OccurrenceStatisticsComponent', () => {
  let component: OccurrenceStatisticsComponent
  let fixture: ComponentFixture<OccurrenceStatisticsComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [OccurrenceStatisticsComponent, LoadingSkeletonComponent, ChartItemComponent, BaseChartDirective]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceStatisticsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
