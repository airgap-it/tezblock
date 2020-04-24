import { createReducer, on } from '@ngrx/store'
import { TezosRewards, TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import * as actions from './actions'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { OperationTypes } from '@tezblock/domain/operations'
import { TableState, getInitialTableState, Pagination, tryUpdateTotal } from '@tezblock/domain/table'
import { Transaction } from '@tezblock/interfaces/Transaction'

interface Busy {
  efficiencyLast10Cycles: boolean
  upcomingRights: boolean
  activeDelegations: boolean
  bakerReward: { [key: string]: boolean }
}

export interface State {
  accountAddress: string
  currentCycle: number
  bakingRights: TableState<AggregatedBakingRights>
  endorsingRights: TableState<AggregatedEndorsingRights>
  kind: string
  efficiencyLast10Cycles: number
  busy: Busy
  upcomingRights: actions.UpcomingRights
  activeDelegations: number
  rewards: TableState<TezosRewards>
  bakerReward: { [key: string]: TezosPayoutInfo }
  votes: TableState<Transaction>
}

const initialState: State = {
  accountAddress: undefined,
  currentCycle: undefined,
  bakingRights: getInitialTableState(undefined, 5),
  endorsingRights: getInitialTableState(undefined, 5),
  kind: undefined,
  efficiencyLast10Cycles: undefined,
  busy: {
    efficiencyLast10Cycles: false,
    upcomingRights: false,
    activeDelegations: false,
    bakerReward: {}
  },
  upcomingRights: undefined,
  activeDelegations: undefined,
  rewards: getInitialTableState(undefined, 3),
  bakerReward: {},
  votes: getInitialTableState()
}

export const reducer = createReducer(
  initialState,
  on(actions.setAccountAddress, (state, { accountAddress }) => ({
    ...state,
    accountAddress
  })),
  on(actions.loadCurrentCycleThenRightsSucceeded, (state, { currentCycle }) => ({
    ...state,
    currentCycle
  })),
  on(actions.loadBakingRights, state => ({
    ...state,
    bakingRights: {
      ...state.bakingRights,
      loading: true
    }
  })),
  on(actions.loadBakingRightsSucceeded, (state, { bakingRights }) => ({
    ...state,
    bakingRights: {
      ...state.bakingRights,
      data: bakingRights,
      loading: false
    }
  })),
  on(actions.loadBakingRightsFailed, state => ({
    ...state,
    bakingRights: {
      ...state.bakingRights,
      loading: false
    }
  })),
  on(actions.loadEndorsingRights, state => ({
    ...state,
    endorsingRights: {
      ...state.endorsingRights,
      loading: true
    }
  })),
  on(actions.loadEndorsingRightsSucceeded, (state, { endorsingRights }) => ({
    ...state,
    endorsingRights: {
      ...state.endorsingRights,
      data: endorsingRights,
      loading: false
    }
  })),
  on(actions.loadEndorsingRightsFailed, state => ({
    ...state,
    endorsingRights: {
      ...state.endorsingRights,
      loading: false
    }
  })),
  on(actions.increaseRightsPageSize, state => ({
    ...state,
    endorsingRights:
      state.kind === OperationTypes.EndorsingRights
        ? {
            ...state.endorsingRights,
            pagination: {
              ...state.endorsingRights.pagination,
              currentPage: state.endorsingRights.pagination.currentPage + 1
            }
          }
        : state.endorsingRights,
    bakingRights:
      state.kind === OperationTypes.BakingRights
        ? {
            ...state.bakingRights,
            pagination: {
              ...state.bakingRights.pagination,
              currentPage: state.bakingRights.pagination.currentPage + 1
            }
          }
        : state.bakingRights
  })),
  on(actions.kindChanged, (state, { kind }) => ({
    ...state,
    kind
  })),

  on(actions.loadEfficiencyLast10Cycles, state => ({
    ...state,
    busy: {
      ...state.busy,
      efficiencyLast10Cycles: true
    }
  })),
  on(actions.loadEfficiencyLast10CyclesSucceeded, (state, { efficiencyLast10Cycles }) => ({
    ...state,
    efficiencyLast10Cycles,
    busy: {
      ...state.busy,
      efficiencyLast10Cycles: false
    }
  })),
  on(actions.loadEfficiencyLast10CyclesFailed, state => ({
    ...state,
    efficiencyLast10Cycles: null,
    busy: {
      ...state.busy,
      efficiencyLast10Cycles: false
    }
  })),
  on(actions.loadUpcomingRights, state => ({
    ...state,
    busy: {
      ...state.busy,
      upcomingRights: true
    }
  })),
  on(actions.loadUpcomingRightsSucceeded, (state, { upcomingRights }) => ({
    ...state,
    upcomingRights,
    busy: {
      ...state.busy,
      upcomingRights: false
    }
  })),
  on(actions.loadUpcomingRightsFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      upcomingRights: false
    }
  })),
  on(actions.loadActiveDelegations, state => ({
    ...state,
    busy: {
      ...state.busy,
      activeDelegations: true
    }
  })),
  on(actions.loadActiveDelegationsSucceeded, (state, { activeDelegations }) => ({
    ...state,
    activeDelegations,
    busy: {
      ...state.busy,
      activeDelegations: false
    }
  })),
  on(actions.loadActiveDelegationsFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      activeDelegations: false
    }
  })),
  on(actions.loadRewards, state => ({
    ...state,
    rewards: {
      ...state.rewards,
      loading: true
    }
  })),
  on(actions.loadRewardsSucceeded, (state, { rewards }) => ({
    ...state,
    rewards: {
      ...state.rewards,
      data: rewards,
      loading: false
    }
  })),
  on(actions.loadRewardsFailed, state => ({
    ...state,
    rewards: {
      ...state.rewards,
      loading: false
    }
  })),
  on(actions.increaseRewardsPageSize, state => ({
    ...state,
    rewards: {
      ...state.rewards,
      pagination: {
        ...state.rewards.pagination,
        currentPage: state.rewards.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadVotes, state => ({
    ...state,
    votes: {
      ...state.votes,
      loading: true
    }
  })),
  on(actions.loadVotesSucceeded, (state, { data }) => ({
    ...state,
    votes: {
      ...state.votes,
      data,
      pagination: tryUpdateTotal(state.votes, data),
      loading: false
    }
  })),
  on(actions.loadVotesFailed, state => ({
    ...state,
    votes: {
      ...state.votes,
      loading: false
    }
  })),
  on(actions.increaseVotesPageSize, state => ({
    ...state,
    votes: {
      ...state.votes,
      pagination: {
        ...state.votes.pagination,
        currentPage: state.votes.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadBakerReward, (state, { baker, cycle }) => ({
    ...state,
    busy: {
      ...state.busy,
      bakerReward: {
        ...state.busy.bakerReward,
        [cycle]: true
      }
    }
  })),
  on(actions.loadBakerRewardSucceeded, (state, { cycle, bakerReward }) => ({
    ...state,
    bakerReward: {
      ...state.bakerReward,
      [cycle]: bakerReward
    },
    busy: {
      ...state.busy,
      bakerReward: {
        ...state.busy.bakerReward,
        [cycle]: false
      }
    }
  })),
  on(actions.loadBakerRewardFailed, (state, { cycle }) => ({
    ...state,
    bakerReward: {
      ...state.bakerReward,
      [cycle]: null
    },
    busy: {
      ...state.busy,
      bakerReward: {
        ...state.busy.bakerReward,
        [cycle]: false
      }
    }
  })),
  on(actions.reset, () => initialState)
)

export const bakerRewardSelector = (cycle: number) => (state: State): TezosPayoutInfo => state.bakerReward[cycle]
