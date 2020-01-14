import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { OccurrenceStatisticsComponent } from './occurrence-statistics.component'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'

describe('OccurrenceStatisticsComponent', () => {
  let component: OccurrenceStatisticsComponent
  let fixture: ComponentFixture<OccurrenceStatisticsComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [OccurrenceStatisticsComponent, LoadingSkeletonComponent]
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
