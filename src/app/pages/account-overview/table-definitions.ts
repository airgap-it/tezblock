import {
  Column,
  Template,
} from '@tezblock/components/tezblock-table/tezblock-table.component';

export const columns: Column[] = [
  {
    name: 'Account',
    field: 'account_id',
    width: '50%',
    template: Template.address,
    data: (item: any) => ({
      data: item.account_id,
      options: { showAlliasOrFullAddress: true },
    }),
  },
  {
    name: 'Balance',
    field: 'balance',
    template: Template.amount,
    data: (item: any) => ({ data: item.balance }),
    sortable: true,
  },
];
