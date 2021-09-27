import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { ProposalDetailComponent } from './proposal-detail.component';
import { initialState as pdInitialState } from './reducer';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import * as fromRoot from '@tezblock/reducers';
import {
  getActivatedRouteMock,
  getParamMapValue,
} from 'test-config/mocks/activated-route.mock';
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { CopyService } from 'src/app/services/copy/copy.service';
import { getCopyServiceMock } from 'src/app/services/copy/copy.service.mock';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe';
import { PeriodKind } from '@tezblock/domain/vote';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent;
  let fixture: ComponentFixture<ProposalDetailComponent>;
  let storeMock: MockStore<any>;
  let store: Store<fromRoot.State>;
  let testScheduler: TestScheduler;
  const initialState = {
    proposalDetails: pdInitialState,
    app: appInitialState,
  };
  const activatedRouteMock = getActivatedRouteMock();
  const chainNetworkServiceMock = getChainNetworkServiceMock();
  const copyServiceMock = getCopyServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        ProposalDetailComponent,
        AliasPipe,
        IconPipe,
        TranslatePipe,
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Actions, useValue: EMPTY },
        AliasPipe,
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: CopyService, useValue: copyServiceMock },
        IconPipe,
        ShortenStringPipe,
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );

    fixture = TestBed.createComponent(ProposalDetailComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
    store = TestBed.inject(Store);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('periodTimespan$', () => {
      it('does not emmit value when periodKind & periodsTimespans is not truthy', () => {
        testScheduler.run(({ expectObservable }) => {
          expectObservable(component.periodTimespan$).toBe('---');
        });
      });

      it('returns periodsTimespan based on periodKind value', () => {
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Exploration,
            periodsTimespans: [10, 20],
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: 20 };

          expectObservable(component.periodTimespan$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });

    describe('noDataLabel$', () => {
      it('does not emit value when proposal is not truthy', () => {
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Testing,
          },
        });

        testScheduler.run(({ expectObservable }) =>
          expectObservable(component.noDataLabel$).toBe('---')
        );
      });

      it('when periodKind is not Testing then returns undefined', () => {
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Promotion,
            proposal: 'foo',
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: undefined };

          expectObservable(component.noDataLabel$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('when periodKind is Testing then returns alias pipe transform + static string', () => {
        const aliasPipe: AliasPipe = TestBed.get(AliasPipe);
        spyOn(aliasPipe, 'transform').and.returnValue('FOO');

        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Testing,
            proposal: {
              proposal: 'foo',
            },
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = {
            a: `FOO upgrade is investigated by the community.`,
          };

          expectObservable(component.noDataLabel$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });

    describe('showRolls$', () => {
      it('when periodKind is not Exploration or Promotion then retuns false', () => {
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Testing,
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: false };

          expectObservable(component.showRolls$).toBe(expected, expectedValues);
        });
      });

      it('when yayRolls is undefined then retuns false', () => {
        // initialState.proposalDetails.yayRolls is by default undefined, but wanted be explicit
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            yayRolls: undefined,
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: false };

          expectObservable(component.showRolls$).toBe(expected, expectedValues);
        });
      });

      it('when periodKind is Exploration or Promotion and yayRolls is not undefined then retuns true', () => {
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Exploration,

            // yayRolls is selector to this:
            divisionOfVotes: [{ max_yay_rolls: 1 }],
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: true };

          expectObservable(component.showRolls$).toBe(expected, expectedValues);
        });
      });
    });
  });
});
