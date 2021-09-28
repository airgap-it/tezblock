import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestScheduler } from 'rxjs/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ClientSideTableComponent } from './client-side-table.component';
import { Pagination } from '@tezblock/domain/table';
import {
  getActivatedRouteMock,
  getParamMapValue,
} from 'test-config/mocks/activated-route.mock';

describe('ClientSideTableComponent', () => {
  let component: ClientSideTableComponent;
  let fixture: ComponentFixture<ClientSideTableComponent>;
  let testScheduler: TestScheduler;
  const activatedRouteMock = getActivatedRouteMock();

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);

      // console.log(`>>>>>> actual: ${JSON.stringify(actual)}`)
      // console.log(`>>>>>> expected: ${JSON.stringify(expected)}`)
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [ClientSideTableComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(ClientSideTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: fix it..
  xdescribe('_data$', () => {
    beforeEach(() => {
      component.dataSource = {
        get: (pagination: Pagination) =>
          of({
            data: [`foo${pagination.currentPage}`],
            total: pagination.total,
          }),
        isFilterable: true,
      };

      component.ngOnInit();
    });

    it('does not emit data when in new pagination currentPage does not change', () => {
      component.pagination$.next({
        selectedSize: 10,
        currentPage: 1,
        total: 100,
      });

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a';
        const expectedValues = { a: { data: ['foo1'], total: undefined } };

        expectObservable((<any>component)._data$).toBe(
          expected,
          expectedValues
        );
      });
    });

    it('emit data when in new pagination currentPage changes', () => {});
  });
});
