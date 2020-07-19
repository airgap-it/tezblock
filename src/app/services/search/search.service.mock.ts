import { EMPTY } from 'rxjs'

export const getSearchServiceMock = () => jasmine.createSpyObj('SearchService', {
    processSearchSelection: EMPTY,
    getPreviousSearches: EMPTY,
    updatePreviousSearches: undefined
})
