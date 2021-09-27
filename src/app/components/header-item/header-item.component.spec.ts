import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { initialState as appInitialState } from '@tezblock/app.reducer';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { getBreakpointObserverMock } from 'test-config/mocks/breakpoint-observer.mock';

import { HeaderItemComponent } from './header-item.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { getPipeMock } from 'test-config/mocks/pipe.mock';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';

describe('HeaderItemComponent', () => {
  let component: HeaderItemComponent;
  let fixture: ComponentFixture<HeaderItemComponent>;
  let storeMock: MockStore<any>;
  let testScheduler: TestScheduler;
  const initialState = { app: appInitialState };
  const chainNetworkServiceMock = getChainNetworkServiceMock();
  const breakpointObserverMock = getBreakpointObserverMock();
  const iconPipeMock = getPipeMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      imports: [
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
        BsDropdownModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: IconPipe, useValue: iconPipeMock },
      ],
      declarations: [HeaderItemComponent, IconPipe],
    });

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(HeaderItemComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // dummy tests : P
  describe('triggers$', () => {
    it('when is mobile then returns empty string', () => {
      breakpointObserverMock.observe.and.returnValue(of({ matches: true }));
      component.ngOnInit();

      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;
        const expected = '(a|)';
        const expectedValues = { a: '' };

        expectObservable(component.triggers$).toBe(expected, expectedValues);
      });
    });

    it('when is NOT mobile then returns "hover"', () => {
      breakpointObserverMock.observe.and.returnValue(of({ matches: false }));
      component.ngOnInit();

      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;
        const expected = '(a|)';
        const expectedValues = { a: 'hover' };

        expectObservable(component.triggers$).toBe(expected, expectedValues);
      });
    });
  });
});
