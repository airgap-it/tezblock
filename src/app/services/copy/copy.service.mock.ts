import { of } from 'rxjs';

export const getCopyServiceMock = () =>
  jasmine.createSpyObj('CopyService', {
    copyToClipboard: undefined,
  });
