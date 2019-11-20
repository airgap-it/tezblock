import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { TestModuleMetadata } from '@angular/core/testing'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterTestingModule } from '@angular/router/testing'

import { PipesModule } from '../src/app/pipes/pipes.module'
import { ApiService } from '@tezblock/services/api/api.service'

import {
  AlertControllerMock,
  AppVersionMock,
  DeeplinkMock,
  LoadingControllerMock,
  ModalControllerMock,
  NavControllerMock,
  PlatformMock,
  SplashScreenMock,
  StatusBarMock,
  ToastControllerMock,
  ApiServiceMock
} from './mocks'

export class UnitHelper {
  public readonly mockRefs = {
    appVersion: new AppVersionMock(),
    platform: new PlatformMock(),
    statusBar: new StatusBarMock(),
    splashScreen: new SplashScreenMock(),
    deeplink: new DeeplinkMock(),
    toastController: new ToastControllerMock(),
    alertController: new AlertControllerMock(),
    loadingController: new LoadingControllerMock(),
    modalController: new ModalControllerMock()
  }

  public testBed(testBed: TestModuleMetadata, useOnlyTestBed: boolean = false): TestModuleMetadata {
    const mandatoryDeclarations: any[] = []
    const mandatoryImports: any[] = [CommonModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule]
    const mandatoryProviders = [
      // { provide: ApiService, useValue: ApiServiceMock }
    ]

    if (!useOnlyTestBed) {
      mandatoryDeclarations.push()
      mandatoryImports.push(PipesModule)
    }

    testBed.declarations = [...(testBed.declarations || []), ...mandatoryDeclarations]
    testBed.imports = [...(testBed.imports || []), ...mandatoryImports]
    testBed.providers = [...(testBed.providers || []), ...mandatoryProviders]

    return testBed
  }
}
