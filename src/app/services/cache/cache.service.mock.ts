import { EMPTY } from 'rxjs'

export const getCacheServiceMock = () => jasmine.createSpyObj('CacheService', {
    delete: EMPTY,
    set: EMPTY,
    get: EMPTY,
    update: undefined,
    executeUpdate: EMPTY
})
