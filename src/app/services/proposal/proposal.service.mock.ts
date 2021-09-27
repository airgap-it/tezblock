import { EMPTY } from 'rxjs';

export const getProposalServiceMock = () =>
  jasmine.createSpyObj('ProposalService', {
    addVoteData: EMPTY,
    getVotingPeriod: EMPTY,
    getVotesForTransaction: EMPTY,
    getMetaVotingPeriods: EMPTY,
    getVotes: EMPTY,
    getProposalVotes: EMPTY,
    getVotesTotal: EMPTY,
    getPeriodsTimespans: EMPTY,
    getProposalDescription: EMPTY,
    getDivisionOfVotes: EMPTY,
    getPeriodInfos: EMPTY,
  });
