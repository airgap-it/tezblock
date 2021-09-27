import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';

import { TransactionDetailComponent } from './transaction-detail.component';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { initialState as tdInitialState } from './reducer';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import {
  getActivatedRouteMock,
  getParamMapValue,
} from 'test-config/mocks/activated-route.mock';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe';
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;
  let storeMock: MockStore<any>;
  let testScheduler: TestScheduler;
  const initialState = {
    app: appInitialState,
    transactionDetails: tdInitialState,
  };
  const chainNetworkServiceMock = getChainNetworkServiceMock();
  const activatedRouteMock = getActivatedRouteMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        AliasPipe,
        IconPipe,
        ShortenStringPipe,
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
      ],
      imports: [],
      declarations: [TransactionDetailComponent, TranslatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );

    fixture = TestBed.createComponent(TransactionDetailComponent);
    storeMock = TestBed.get(MockStore);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('filteredTransactions$', () => {
      it('when transactions is not an array then does not emit value', () => {
        testScheduler.run(({ expectObservable }) =>
          expectObservable(component.filteredTransactions$).toBe('---')
        );
      });

      it('filters transactions by kind', () => {
        const transactionA = { kind: 'A' };
        const transactionB = { kind: 'B' };

        storeMock.setState({
          ...initialState,
          transactionDetails: {
            ...initialState.transactionDetails,
            transactions: {
              ...initialState.transactionDetails.transactions,
              data: [transactionA, transactionB],
            },
            kind: 'A',
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: [transactionA] };

          expectObservable(component.filteredTransactions$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });

    describe(`numberOfConfirmations$`, () => {
      it('when latestBlock is not truthy then does not emit value', () => {
        testScheduler.run(({ expectObservable }) =>
          expectObservable(component.numberOfConfirmations$).toBe('---')
        );
      });

      it('returns difference between the latest block level and given block level', () => {
        storeMock.setState({
          ...initialState,
          transactionDetails: {
            ...initialState.transactionDetails,
            transactions: {
              ...initialState.transactionDetails.transactions,
              data: [{ block_level: 3 }],
            },
            latestBlock: { level: 13 },
          },
        });

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a';
          const expectedValues = { a: 10 };

          expectObservable(component.numberOfConfirmations$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });
  });
});
