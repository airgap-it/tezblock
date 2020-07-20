import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MomentModule } from 'ngx-moment'
import { EMPTY } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import * as moment from 'moment'

import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { initialState as lInitialState } from './reducer'
import { TransactionChartItem } from './actions'

import { ListComponent, timestampsToCountsPerDay, toAmountPerDay } from './list.component'

describe('ListComponent', () => {
  let component: ListComponent
  let fixture: ComponentFixture<ListComponent>
  let storeMock: MockStore<any>
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const initialState = { list: lInitialState }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Actions, useValue: EMPTY },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        },
        provideMockStore({ initialState })
      ],
      imports: [RouterTestingModule.withRoutes([]), MomentModule],
      declarations: [ListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ListComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('timestampsToCountsPerDay', () => {
    it('counts only dates from last 7 days', () => {
      const _12daysAgo = moment()
        .add(-12, 'days')
        .valueOf()
      const _8daysAgo = moment()
        .add(-8, 'days')
        .valueOf()
      const _6daysAgo = moment()
        .add(-6, 'days')
        .valueOf()
      const _3daysAgo = moment()
        .add(-3, 'days')
        .valueOf()

      expect(timestampsToCountsPerDay([_12daysAgo, _8daysAgo, _6daysAgo, _3daysAgo, _3daysAgo])).toEqual([0, 0, 0, 2, 0, 0, 1])
    })
  })

  describe('toAmountPerDay', () => {
    it('sum amounts for each of last 7 days converting to xtz', () => {
      const xtzDecimalsShift = 6
      const innerFunctionShift = 3
      const shift = xtzDecimalsShift + innerFunctionShift

      const input: TransactionChartItem[] = [
        {
          timestamp: moment()
            .add(-12, 'days')
            .valueOf(),
          amount: 1 * Math.pow(10, shift)
        },
        {
          timestamp: moment()
            .add(-3, 'days')
            .valueOf(),
          amount: 5 * Math.pow(10, shift)
        }
      ]

      expect(toAmountPerDay(input)).toEqual([0, 0, 0, 5, 0, 0, 0])
    })
  })

  describe('transaction', () => {
    describe('transactionsChartOptions', () => {
      it('when tooltipItems datasetIndex is not 0 then returns data in pattern "{label}: {value}K ꜩ"', () => {
        component.ngOnInit()
        activatedRouteMock.paramMap.next(getParamMapValue('transaction'))

        expect(component.transactionsChartOptions.tooltips.callbacks.label(
          {
            datasetIndex: 1,
            index: 0
          },
          {
            datasets: [
              null,
              { 
                label: 'foo',
                data: [7]
              }
            ]
          }
        )).toBe('foo: 7K ꜩ')
      })

      it('when tooltipItems datasetIndex is 0 then returns data in pattern "{label}: {value}"', () => {
        component.ngOnInit()
        activatedRouteMock.paramMap.next(getParamMapValue('transaction'))

        expect(component.transactionsChartOptions.tooltips.callbacks.label(
          {
            datasetIndex: 0,
            index: 0
          },
          {
            datasets: [
              { 
                label: 'foo',
                data: [7]
              }
            ]
          }
        )).toBe('foo: 7')
      })
    })
  })
})
