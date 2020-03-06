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
