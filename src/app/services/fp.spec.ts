import { isNotEmptyArray } from './fp'

fdescribe('Functional Programming', () => {
  it('isNotEmptyArray of null returns false', () => {
    expect(isNotEmptyArray(null)).not.toBeTruthy()
  })

  it('isNotEmptyArray of not empty Array returns true', () => {
    expect(isNotEmptyArray([1, 2, 3])).toBeTruthy()
  })

  it('isNotEmptyArray of empty Array returns false', () => {
    expect(isNotEmptyArray([])).not.toBeTruthy()
  })

  it('isNotEmptyArray of Object returns false', () => {
    expect(isNotEmptyArray({ x: 1 })).not.toBeTruthy()
  })
})
