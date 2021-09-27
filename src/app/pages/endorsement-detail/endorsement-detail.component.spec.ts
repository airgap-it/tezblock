import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { MomentModule } from 'ngx-moment';
import { ActivatedRoute } from '@angular/router';

import { EndorsementDetailComponent } from './endorsement-detail.component';
import {
  getActivatedRouteMock,
  getParamMapValue,
} from 'test-config/mocks/activated-route.mock';
import { initialState as edInitialState } from './reducer';
import { CopyService } from 'src/app/services/copy/copy.service';
import { getCopyServiceMock } from 'src/app/services/copy/copy.service.mock';
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe';
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe';

describe('EndorsementDetailComponent', () => {
  let component: EndorsementDetailComponent;
  let fixture: ComponentFixture<EndorsementDetailComponent>;
  let storeMock: MockStore<any>;
  let testScheduler: TestScheduler;
  const activatedRouteMock = getActivatedRouteMock();
  const initialState = { endorsementDetails: edInitialState };
  const copyServiceMock = getCopyServiceMock();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [EndorsementDetailComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: CopyService, useValue: copyServiceMock },
        AliasPipe,
        ShortenStringPipe,
      ],
    });

    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );

    fixture = TestBed.createComponent(EndorsementDetailComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('endorsedSlots$: removes brackets from slots', () => {
    storeMock.setState({
      ...initialState,
      endorsementDetails: {
        ...initialState.endorsementDetails,
        selectedEndorsement: {
          slots: '[1,2,3]',
        },
      },
    });

    component.ngOnInit();

    testScheduler.run(({ expectObservable }) => {
      const expected = 'a';
      const expectedValues = { a: '1,2,3' };

      expectObservable(component.endorsedSlots$).toBe(expected, expectedValues);
    });
  });

  it('endorsedSlotsCount$: counts numbers in string omitting brackets', () => {
    storeMock.setState({
      ...initialState,
      endorsementDetails: {
        ...initialState.endorsementDetails,
        selectedEndorsement: {
          slots: '[1,2,3]',
        },
      },
    });

    component.ngOnInit();

    testScheduler.run(({ expectObservable }) => {
      const expected = 'a';
      const expectedValues = { a: 3 };

      expectObservable(component.endorsedSlotsCount$).toBe(
        expected,
        expectedValues
      );
    });
  });
});
