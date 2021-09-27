import { createReducer, on } from '@ngrx/store';
import * as moment from 'moment';

import * as actions from './actions';
import { BlockStatus } from '@tezblock/services/health/health.service';

const correctTimestamp = (latestNodeBlock: any): any => {
  return latestNodeBlock
    ? {
        ...latestNodeBlock,
        header: {
          ...latestNodeBlock.header,
          timestamp: moment.utc(latestNodeBlock.header.timestamp).valueOf(),
        },
      }
    : latestNodeBlock;
};

export interface State {
  latestNodeBlock: any;
  latestConseilBlock: BlockStatus;
}

export const initialState: State = {
  latestNodeBlock: undefined,
  latestConseilBlock: undefined,
};

export const reducer = createReducer(
  initialState,
  on(actions.loadLatestNodeBlockSucceeded, (state, { latestNodeBlock }) => ({
    ...state,
    latestNodeBlock: correctTimestamp(latestNodeBlock),
  })),
  on(
    actions.loadLatestConseilBlockSucceeded,
    (state, { latestConseilBlock }) => ({
      ...state,
      latestConseilBlock,
    })
  ),
  on(actions.reset, () => initialState)
);
