import { of } from 'rxjs'

export const getBakingServiceMock = () => jasmine.createSpyObj('BakingService', {
    getBakingBadRatings: of(null),
    getTezosBakerInfos: of(null).toPromise(),
    getBakerInfos: of(null).toPromise(),
    getEfficiencyLast10Cycles: of(null)
})
