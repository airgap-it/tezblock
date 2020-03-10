import { numberOfBlocksToSeconds } from '@tezblock/services/cycle/cycle.service'
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
  Promotion = 'promotion_vote'
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
    value + numberOfBlocksToSeconds(blocksPerVotingPeriod) * 1000 * periodsBetween

  const getFromPrevious = (index: number, array: PeriodTimespan[], isStart: boolean, originIndex: number): number => {
    if (index < 0) {
      return null
    }

    return array[index].end
      ? fromPeriod(array[index].end, originIndex - index + (isStart ? -1 : 0))
      : array[index].start
      ? fromPeriod(array[index].end, originIndex - index + (isStart ? 0 : 1))
      : getFromPrevious(index - 1, array, isStart, originIndex)
  }

  const getPeriod = (period: PeriodTimespan, index: number, array: PeriodTimespan[]): PeriodTimespan => ({
    start: period.start || getFromPrevious(index - 1, array, true, index),
    end: period.end || period.start ? fromPeriod(period.start, 1) : getFromPrevious(index - 1, array, false, index)
  })

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
