import { createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';

import * as actions from './actions';
import { Transaction } from '@tezblock/interfaces/Transaction';

interface ParsedTransaction extends Transaction {
  parsedSlots: number[];
}

type StotState = 'selected' | 'not_selected' | 'empty';

export interface Slot {
  index: number;
  operation_group_hash: string;
  endorser: string;
  state: StotState;
}

const toParsedEndorsement = (endorsement: Transaction): ParsedTransaction => ({
  ...endorsement,
  parsedSlots: JSON.parse(endorsement.slots),
});

const getSlots = (
  endorsements: ParsedTransaction[],
  selectedEndorsementId: string
): Slot[] => {
  return _.range(0, 32).map((index) => {
    const endorsement = _.find(
      endorsements,
      (endorsementItem) => endorsementItem.parsedSlots.indexOf(index) !== -1
    );

    return <Slot>{
      index,
      operation_group_hash: endorsement
        ? endorsement.operation_group_hash
        : null,
      endorser: endorsement ? endorsement.delegate : null,
      state: endorsement
        ? endorsement.operation_group_hash === selectedEndorsementId
          ? 'selected'
          : 'not_selected'
        : 'empty',
    };
  });
};

export interface State {
  endorsements: ParsedTransaction[];
  selectedEndorsement: Transaction;
  slots: Slot[];
}

export const initialState: State = {
  endorsements: undefined,
  selectedEndorsement: undefined,
  slots: undefined,
};

export const reducer = createReducer(
  initialState,
  on(actions.reset, (state, { id }) => ({
    ...state,
    ...(state.selectedEndorsement &&
    state.selectedEndorsement.operation_group_hash === id
      ? null
      : initialState),
  })),
  on(actions.loadEndorsementsSucceeded, (state, { endorsements }) => {
    const newEndorsements = endorsements.map(toParsedEndorsement);

    return {
      ...state,
      endorsements: newEndorsements,
      slots: getSlots(
        newEndorsements,
        state.selectedEndorsement.operation_group_hash
      ),
    };
  }),
  on(actions.loadEndorsementDetailsSucceeded, (state, { endorsement }) => ({
    ...state,
    selectedEndorsement: endorsement || null,
  })),
  on(actions.loadEndorsementDetailsFailed, (state) => ({
    ...state,
    selectedEndorsement: null,
  })),
  on(actions.slotSelected, (state, { operation_group_hash }) => ({
    ...state,
    selectedEndorsement: state.endorsements.find(
      (endorsement) => endorsement.operation_group_hash === operation_group_hash
    ),
    slots: getSlots(state.endorsements, operation_group_hash),
  }))
);

export const getEndorsements = (state: State) => state.endorsements;
export const getSelectedEndorsement = (state: State) =>
  state.selectedEndorsement;
