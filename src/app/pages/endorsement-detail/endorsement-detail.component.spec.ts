import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MomentModule } from 'ngx-moment'
import { Store } from '@ngrx/store'

import { UnitHelper } from 'test-config/unit-test-helper'
import { EndorsementDetailComponent } from './endorsement-detail.component'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { IdenticonComponent } from 'src/app/components/identicon/identicon'
import { LoadingSkeletonComponent } from 'src/app/components/loading-skeleton/loading-skeleton.component'

describe('EndorsementDetailComponent', () => {
  let component: EndorsementDetailComponent
  let fixture: ComponentFixture<EndorsementDetailComponent>
  let storeMock

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch'])

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [FontAwesomeModule, MomentModule],
        declarations: [AddressItemComponent, IdenticonComponent, LoadingSkeletonComponent, EndorsementDetailComponent],
        providers: [{ provide: Store, useValue: storeMock }]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EndorsementDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
