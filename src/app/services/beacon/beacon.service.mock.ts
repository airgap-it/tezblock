import { EMPTY } from 'rxjs'

export const getBeaconServiceMock = () => jasmine.createSpyObj('BeaconService', {
    delegate: EMPTY.toPromise()
})
