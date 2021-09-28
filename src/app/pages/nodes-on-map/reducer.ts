import { createReducer, on } from '@ngrx/store';

import * as actions from './actions';
import { Heatmap, Node } from './model';
import { getInitialTableState, sort, TableState } from '@tezblock/domain/table';
import { get } from '@tezblock/services/fp';

export interface State {
  busy: {
    connectedNodesPerCountry: boolean;
  };
  connectedNodes: TableState<Node>;
  connectedNodesPerCountry: Heatmap[];
}

export const initialState: State = {
  busy: {
    connectedNodesPerCountry: false,
  },
  connectedNodes: getInitialTableState(),
  connectedNodesPerCountry: undefined,
};

export const reducer = createReducer(
  initialState,
  on(actions.loadConnectedNodes, (state) => ({
    ...state,
    connectedNodes: {
      ...state.connectedNodes,
      loading: true,
    },
  })),
  on(actions.loadConnectedNodesSucceeded, (state, { data }) => ({
    ...state,
    connectedNodes: {
      ...state.connectedNodes,
      data,
      loading: false,
    },
  })),
  on(actions.loadConnectedNodesFailed, (state) => ({
    ...state,
    connectedNodes: {
      ...state.connectedNodes,
      data: null,
      loading: false,
    },
  })),
  on(actions.loadMoreConnectedNodes, (state) => {
    const currentPage: number = state.connectedNodes.pagination.currentPage + 1;
    const dataTotal: number = get<Node[]>((_data) => _data.length)(
      state.connectedNodes.data
    );
    const dataTotalPages: number = get<number>((total) =>
      Math.ceil(total / state.connectedNodes.pagination.selectedSize)
    )(dataTotal);

    return {
      ...state,
      connectedNodes: {
        ...state.connectedNodes,
        pagination: {
          ...state.connectedNodes.pagination,
          currentPage,
          total: currentPage === dataTotalPages ? dataTotal : undefined,
        },
      },
    };
  }),
  on(actions.loadConnectedNodesPerCountry, (state) => ({
    ...state,
    busy: {
      connectedNodesPerCountry: true,
    },
  })),
  on(
    actions.loadConnectedNodesPerCountrySucceeded,
    (state, { connectedNodesPerCountry }) => ({
      ...state,
      connectedNodesPerCountry,
      busy: {
        connectedNodesPerCountry: false,
      },
    })
  ),
  on(actions.loadConnectedNodesPerCountryFailed, (state) => ({
    ...state,
    busy: {
      connectedNodesPerCountry: false,
    },
  })),
  on(actions.sortNodes, (state, { orderBy }) => ({
    ...state,
    connectedNodes: {
      ...state.connectedNodes,
      orderBy,
    },
  })),
  on(actions.reset, () => initialState)
);
