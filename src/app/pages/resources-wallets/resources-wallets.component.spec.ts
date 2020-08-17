import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { ResourcesWalletsComponent } from './resources-wallets.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

describe('ResourcesWalletsComponent', () => {
  let component: ResourcesWalletsComponent
  let fixture: ComponentFixture<ResourcesWalletsComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IconPipe],
      imports: [FontAwesomeModule],
      declarations: [ResourcesWalletsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ResourcesWalletsComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
