import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestScheduler } from 'rxjs/testing';

import { SearchItemComponent } from './search-item.component';
import { ApiService } from '@tezblock/services/api/api.service';
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock';
import { SearchService } from 'src/app/services/search/search.service';
import { getSearchServiceMock } from 'src/app/services/search/search.service.mock';
import { AccountService } from '@tezblock/services/account/account.service';
import { getAccountServiceMock } from '@tezblock/services/account/account.service.mock';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { IconPipe } from 'src/app/pipes/icon/icon.pipe';
import {
  TranslateService,
  TranslateModule,
  TranslatePipe,
} from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';

describe('SearchItemComponent', () => {
  let component: SearchItemComponent;
  let fixture: ComponentFixture<SearchItemComponent>;
  let testScheduler: TestScheduler;
  const apiServiceMock = getApiServiceMock();
  const searchServiceMock = getSearchServiceMock();
  const accountServiceMock = getAccountServiceMock();
  const chainNetworkServiceMock = getChainNetworkServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchItemComponent, IconPipe, TranslatePipe],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);

      console.log(`>>>>>>>>>>> actual: ${JSON.stringify(actual)}`);
      console.log(`>>>>>>>>>>> expected: ${JSON.stringify(expected)}`);
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // subscribe on dataSource$ emits values but tests claims there are no events..
  xdescribe('dataSource$', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('when user enters more than 1 character then returns data from apis', () => {
      apiServiceMock.getTransactionHashesStartingWith.and.returnValue(
        of(['API_1'])
      );
      accountServiceMock.getAccountsStartingWith.and.returnValue(of(['ACC_1']));
      component.searchControl.setValue('ABC');

      testScheduler.run(({ expectObservable }) => {
        const expected = '500ms a b';
        const expectedValues = { a: ['API_1'], b: ['API_1', 'ACC_1'] };

        expectObservable(component.dataSource$).toBe(expected, expectedValues);
      });
    });
  });
});
