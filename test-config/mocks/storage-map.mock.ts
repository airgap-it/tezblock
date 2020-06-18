import { EMPTY } from 'rxjs'

export const getStorageMapMock = () => jasmine.createSpyObj('StorageMap', { 
    get: EMPTY,
    set: EMPTY,
    delete: EMPTY,
    clear: EMPTY,
    keys: EMPTY,
    has: EMPTY
})
