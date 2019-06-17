import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TezblockTableComponent } from './tezblock-table.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component'

describe('TezblockTableComponent', () => {
  let component: TezblockTableComponent
  let fixture: ComponentFixture<TezblockTableComponent>

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [],
        declarations: [TezblockTableComponent, LoadingSkeletonComponent]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TezblockTableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
