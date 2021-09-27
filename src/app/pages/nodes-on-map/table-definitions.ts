import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';

export const columns = (): Column[] => [
  {
    name: 'Country',
    field: 'country',
    sortable: true,
  },
  {
    name: 'Code',
    field: 'countryCode',
    sortable: true,
  },
  {
    name: 'City',
    field: 'city',
    sortable: true,
  },
  {
    name: 'Hosting',
    field: 'org',
    sortable: true,
  },
  {
    name: 'Neighbours',
    field: 'neighbours',
    sortable: true,
  },
];
