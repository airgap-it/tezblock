import { numberOfBlocksToSecondsFromPeriod } from '@tezblock/app.reducer'
import { Operation, Direction, Body } from '@tezblock/services/base.service'

export interface VotingInfo {
  pkh: string
  rolls: number
}

export interface VotingPeriod {
  level: number
  period_kind: string
}

export enum PeriodKind {
  Proposal = 'proposal',
  Exploration = 'testing_vote',
  Testing = 'testing',
  Promotion = 'promotion_vote',
  Adoption = 'adoption'
}

export interface MetaVotingPeriod {
  periodKind: PeriodKind
  value?: number
  count?: number
}

export interface PeriodTimespan {
  start: number
  end: number
}

export const fillMissingPeriodTimespans = (periodsTimespans: PeriodTimespan[], blocksPerVotingPeriod: number) => {
  const fromPeriod = (value: number, periodsBetween: number): number =>
    value + numberOfBlocksToSecondsFromPeriod(blocksPerVotingPeriod) * 1000 * periodsBetween

  const getFromPrevious = (index: number, array: PeriodTimespan[], isStart: boolean, originIndex: number): number => {
    if (index < 0) {
      return null
    }
    return array[index].end
      ? fromPeriod(array[index].end, originIndex - index + (isStart ? -1 : 0))
      : array[index].start
      ? fromPeriod(array[index].start, originIndex - index + (isStart ? 0 : 1))
      : getFromPrevious(index - 1, array, isStart, originIndex)
  }

  const getPeriod = (period: PeriodTimespan, index: number, array: PeriodTimespan[]): PeriodTimespan => {
    return {
      start: period.start || getFromPrevious(index - 1, array, true, index),
      end: period.end || period.start ? fromPeriod(period.start, 1) : getFromPrevious(index - 1, array, false, index)
    }
  }

  return periodsTimespans.map(getPeriod)
}

export const getPeriodTimespanQuery = (period: number, direction: Direction): Body => ({
  fields: ['timestamp'],
  predicates: [
    {
      field: 'meta_voting_period',
      operation: Operation.eq,
      set: [period],
      inverse: false
    }
  ],
  orderBy: [
    {
      field: 'level',
      direction
    }
  ],
  limit: 1
})

export interface DivisionOfVotes {
  voting_period: number
  max_yay_rolls: number
  max_yay_count: number
  max_nay_rolls: number
  max_nay_count: number
  max_pass_rolls: number
  max_pass_count: number
  proposal_hash: string
  voting_period_kind: string
  max_level: number
}

export const _yayRollsSelector = (divisionOfVotes: DivisionOfVotes[]): number =>
  divisionOfVotes ? divisionOfVotes.map((x) => x.max_yay_rolls).reduce((a, b) => a + b, 0) : undefined
export const _nayRollsSelector = (divisionOfVotes: DivisionOfVotes[]): number =>
  divisionOfVotes ? divisionOfVotes.map((x) => x.max_nay_rolls).reduce((a, b) => a + b, 0) : undefined
export const _passRollsSelector = (divisionOfVotes: DivisionOfVotes[]): number =>
  divisionOfVotes ? divisionOfVotes.map((x) => x.max_pass_rolls).reduce((a, b) => a + b, 0) : undefined
const allRollsSelector = (divisionOfVotes: DivisionOfVotes[]): number =>
  _yayRollsSelector(divisionOfVotes) + _nayRollsSelector(divisionOfVotes)
export const _yayRollsPercentageSelector = (divisionOfVotes: DivisionOfVotes[]): number =>
  allRollsSelector(divisionOfVotes) > 0
    ? Math.round((_yayRollsSelector(divisionOfVotes) / allRollsSelector(divisionOfVotes)) * 10000) / 100
    : 0
export const _nayRollsPercentageSelector = (divisionOfVotes: DivisionOfVotes[]): number =>
  allRollsSelector(divisionOfVotes) > 0
    ? Math.round((_nayRollsSelector(divisionOfVotes) / allRollsSelector(divisionOfVotes)) * 10000) / 100
    : 0
