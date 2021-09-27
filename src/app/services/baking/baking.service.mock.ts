import { EMPTY } from 'rxjs';

export const getBakingServiceMock = () =>
  jasmine.createSpyObj('BakingService', {
    getBakingBadRatings: EMPTY,
    getTezosBakerInfos: Promise.resolve(null),
    getBakerInfos: Promise.resolve(null),
    getEfficiencyLast10Cycles: EMPTY,
  });
