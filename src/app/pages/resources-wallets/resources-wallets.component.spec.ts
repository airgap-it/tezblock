import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { ResourcesWalletsComponent } from './resources-wallets.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

describe('ResourcesWalletsComponent', () => {
  let component: ResourcesWalletsComponent
  let fixture: ComponentFixture<ResourcesWalletsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcesWalletsComponent, FontAwesomeModule, IconPipe]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesWalletsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
