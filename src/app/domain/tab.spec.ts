import { aggregateOperationCounts, compareTabWith, Count, isTabKindEqualTo, kindToOperationTypes, Tab, updateTabCounts } from './tab'
import { OperationTypes } from '@tezblock/domain/operations'
import { OperationCount } from '@tezblock/services/api/api.service'

describe('tab', () => {
  let tab: Tab

  beforeEach(() => {
    tab = {
      title: 'foo',
      active: false,
      count: 0,
      kind: ['foo'],
      disabled: () => false
    }
  })

  it('isTabKindEqualTo: checks if tabs kind is equal to given tab', () => {
    expect(isTabKindEqualTo('foo')(tab)).toBe(true)
  })

  it('compareTabWith: compares tabs title to given value', () => {
    expect(compareTabWith('foo')(tab)).toBe(true)
    expect(compareTabWith('foo2')(tab)).toBe(false)
  })

  describe('kindToOperationTypes', () => {
    it('when kind is array then returns OperationTypes.Ballot', () => {
      expect(kindToOperationTypes([])).toBe(OperationTypes.Ballot)
    })

    it('when kind is NOT an array then returns kind', () => {
      expect(kindToOperationTypes('foo')).toBe('foo')
    })
  })

  describe('aggregateOperationCounts', () => {
    it('when agument does not have properties count_{field} then returns count NaN', () => {
      const argument: OperationCount[] = [
        {
          count_foo2: '10',
          field: 'foo',
          kind: 'foo2'
        },
        {
          count_foo2: '10',
          field: 'foo',
          kind: 'foo2'
        }
      ]
      const result = aggregateOperationCounts(argument)

      expect(result[0]).toEqual({ key: 'foo2', count: NaN })
    })

    it('when agument has proper format and has properties count_{field} then returns count by kind', () => {
      const argument: OperationCount[] = [
        {
          count_foo: '10',
          field: 'foo',
          kind: 'foo2'
        },
        {
          count_foo: '10',
          field: 'foo',
          kind: 'foo2'
        }
      ]
      const result = aggregateOperationCounts(argument)

      expect(result[0]).toEqual({ key: 'foo2', count: 20 })
    })
  })

  it('updateTabCounts: updates tabs count property', () => {
    const tabs: Tab[] = [
      {
        title: 'foo1',
        active: false,
        count: 0,
        kind: ['foo1'],
        disabled: () => false
      },
      {
        title: 'foo2',
        active: false,
        count: 0,
        kind: ['foo2'],
        disabled: () => false
      }
    ]
    const counts: Count[] = [
      {
        key: 'foo1',
        count: 10
      },
      {
        key: 'foo2',
        count: 20
      }
    ]
    const response = updateTabCounts(tabs, counts)

    expect(<any>response[0]).toEqual(
      jasmine.objectContaining({
        count: 10,
        kind: ['foo1']
      })
    )
    expect(<any>response[1]).toEqual(
      jasmine.objectContaining({
        count: 20,
        kind: ['foo2']
      })
    )
  })
})
