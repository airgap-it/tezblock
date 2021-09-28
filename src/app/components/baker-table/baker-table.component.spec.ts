import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { EMPTY } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { ActivatedRoute } from '@angular/router';

import { BakerTableComponent } from './baker-table.component';
import * as actions from './actions';
import { initialState as btInitialState } from './reducer';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import { initialState as adInitialState } from '@tezblock/pages/account-detail/reducer';
import {
  getActivatedRouteMock,
  getParamMapValue,
} from 'test-config/mocks/activated-route.mock';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { RewardService } from '@tezblock/services/reward/reward.service';
import { getRewardServiceMock } from '@tezblock/services/reward/reward.service.mock';
import { OperationTypes } from '@tezblock/domain/operations';
import { DataSource } from '@tezblock/domain/table';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslatePipe,
} from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';

describe('BakerTableComponent', () => {
  let component: BakerTableComponent;
  let fixture: ComponentFixture<BakerTableComponent>;
  let storeMock: MockStore<any>;
  let testScheduler: TestScheduler;
  const initialState = {
    accountDetails: adInitialState,
    bakerTable: btInitialState,
    app: appInitialState,
  };
  const activatedRouteMock = getActivatedRouteMock();
  const chainNetworkServiceMock = getChainNetworkServiceMock();
  const rewardServiceMock = getRewardServiceMock();

  function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient],
          },
        }),
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: RewardService, useValue: rewardServiceMock },

        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
      ],
      declarations: [BakerTableComponent, TranslatePipe],
    });

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(BakerTableComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('isRightsTabAvailable$', () => {
      it('when upcomingRights is not truthy then returns true', () => {
        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: true };

          expectObservable(component.isRightsTabAvailable$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('when selectedTab.kind is "baking_rights" and upcomingRights.baking is truthy then returns true', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              baking: 'foo',
            },
          },
        });

        component.selectedTab = {
          kind: OperationTypes.BakingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false,
        };

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: true };

          expectObservable(component.isRightsTabAvailable$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('when selectedTab.kind is "baking_rights" and upcomingRights.baking is not truthy then returns false', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              baking: null,
            },
          },
        });

        component.selectedTab = {
          kind: OperationTypes.BakingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false,
        };

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: false };

          expectObservable(component.isRightsTabAvailable$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('when selectedTab.kind is NOT "baking_rights" and upcomingRights.endorsing is truthy then returns true', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              endorsing: 'foo',
            },
          },
        });

        component.selectedTab = {
          kind: OperationTypes.EndorsingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false,
        };

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: true };

          expectObservable(component.isRightsTabAvailable$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('when selectedTab.kind is NOT "baking_rights" and upcomingRights.endorsing is NOT truthy then returns false', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              endorsing: null,
            },
          },
        });

        component.selectedTab = {
          kind: OperationTypes.EndorsingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false,
        };

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: false };

          expectObservable(component.isRightsTabAvailable$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });
  });

  describe('getRewardsInnerDataSource', () => {
    it('returns data from rewardService.getRewardsPayouts using rewards  filtered by cycle', () => {
      const reward1 = { cycle: 1, data: 'foo1' };
      const reward2 = { cycle: 2, data: 'foo2' };

      storeMock.setState({
        ...initialState,
        bakerTable: {
          ...initialState.bakerTable,
          rewards: {
            data: [reward1, reward2],
          },
        },
      });

      const dataSource: DataSource<any> = (<any>(
        component
      )).getRewardsInnerDataSource(2);
      dataSource.get(null);

      expect(rewardServiceMock.getRewardsPayouts).toHaveBeenCalledWith(
        reward2,
        null,
        undefined
      );
    });
  });

  describe('getEndorsingRightsInnerDataSource', () => {
    const endorsingRights = { cycle: 3, endorsingRewardsDetails: [] };

    it('dispatches loadEndorsingRightItems  action', () => {
      const dataSource: DataSource<any> = (<any>(
        component
      )).getEndorsingRightsInnerDataSource(endorsingRights);

      component.address = 'fakeAddress';
      spyOn(storeMock, 'dispatch');
      dataSource.get(null);

      expect(storeMock.dispatch).toHaveBeenCalledWith(
        actions.loadEndorsingRightItems({
          baker: 'fakeAddress',
          cycle: 3,
          endorsingRewardsDetails: [],
        })
      );
    });

    it('returns pagable response using endorsingRightItems from ngrx store', () => {
      const fakeEndorsingRightItems = [
        'foo1',
        'foo2',
        'foo3',
        'foo4',
        'foo5',
        'foo6',
        'foo7',
        'foo8',
        'foo9',
      ];

      storeMock.setState({
        ...initialState,
        bakerTable: {
          ...initialState.bakerTable,
          endorsingRightItems: {
            '3': fakeEndorsingRightItems,
          },
        },
      });

      const dataSource: DataSource<any> = (<any>(
        component
      )).getEndorsingRightsInnerDataSource(endorsingRights);

      const data$ = dataSource.get({ currentPage: 2, selectedSize: 3 });

      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;
        const expected = 'a';
        const expectedValues = {
          a: {
            data: ['foo4', 'foo5', 'foo6'],
            total: fakeEndorsingRightItems.length,
          },
        };

        expectObservable(data$).toBe(expected, expectedValues);
      });
    });
  });

  describe('getBakingRightsInnerDataSource', () => {
    const bakingRights = { cycle: 3, bakingRewardsDetails: [] };

    it('dispatches loadBakingRightItems  action', () => {
      const dataSource: DataSource<any> = (<any>(
        component
      )).getBakingRightsInnerDataSource(bakingRights);

      component.address = 'fakeAddress';
      spyOn(storeMock, 'dispatch');
      dataSource.get(null);

      expect(storeMock.dispatch).toHaveBeenCalledWith(
        actions.loadBakingRightItems({
          baker: 'fakeAddress',
          cycle: 3,
          bakingRewardsDetails: [],
        })
      );
    });

    it('returns pagable response using bakingRightItems from ngrx store', () => {
      const fakeBakingRightItems = [
        'foo1',
        'foo2',
        'foo3',
        'foo4',
        'foo5',
        'foo6',
        'foo7',
        'foo8',
        'foo9',
      ];

      storeMock.setState({
        ...initialState,
        bakerTable: {
          ...initialState.bakerTable,
          bakingRightItems: {
            '3': fakeBakingRightItems,
          },
        },
      });

      const dataSource: DataSource<any> = (<any>(
        component
      )).getBakingRightsInnerDataSource(bakingRights);

      const data$ = dataSource.get({ currentPage: 2, selectedSize: 3 });

      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;
        const expected = 'a';
        const expectedValues = {
          a: {
            data: ['foo4', 'foo5', 'foo6'],
            total: fakeBakingRightItems.length,
          },
        };

        expectObservable(data$).toBe(expected, expectedValues);
      });
    });
  });
});
