import { EMPTY } from 'rxjs';

export const getProtocolVariablesServiceMock = () =>
  jasmine.createSpyObj('ProtocolVariablesService', {
    getProtocolVariables: EMPTY,
    getBlocksPerVotingPeriod: EMPTY,
  });
