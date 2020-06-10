import { Subject } from 'rxjs'

export const getParamMapValue = (value: string) => ({ get: () => value })

export const getActivatedRouteMock = () => ({ paramMap: new Subject() })
