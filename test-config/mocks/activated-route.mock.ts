import { Subject } from 'rxjs'

export const getParamMapValue = (value: string) => ({ get: () => value })

export const getActivatedRouteMock = () => ({
  paramMap: new Subject(),
  snapshot: { params: {}, queryParamMap: { get: jasmine.createSpy('queryParamMap.get') } }
})
