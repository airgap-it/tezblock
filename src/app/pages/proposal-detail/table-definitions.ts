import {
  Column,
  Template,
  blockAndTxHashColumns,
} from '@tezblock/components/tezblock-table/tezblock-table.component';
import { TranslateService } from '@ngx-translate/core';

export const columns = (translate: TranslateService): Column[] =>
  [
    {
      name: translate.instant('tezblock-table.proposal.baker'),
      field: 'source',
      width: '1',
      template: Template.address,
    },
    {
      name: translate.instant('tezblock-table.proposal.ballot'),
      field: 'ballot',
    },
    {
      name: translate.instant('tezblock-table.proposal.age'),
      field: 'timestamp',
      template: Template.timestamp,
    },
    // {
    //   name: 'Kind',
    //   field: 'kind'
    // },
    // {
    //   name: 'Voting Period',
    //   field: 'voting_period'
    // },
    {
      name: translate.instant('tezblock-table.proposal.number-of-votes'),
      field: 'votes',
    },
  ].concat(<any>blockAndTxHashColumns);
