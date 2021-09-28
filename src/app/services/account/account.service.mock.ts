import { EMPTY } from 'rxjs';

export const getAccountServiceMock = () =>
  jasmine.createSpyObj('AccountService', {
    getAccountById: EMPTY,
    getAccountsByIds: EMPTY,
    getDelegatedAccounts: EMPTY,
    getAccountStatus: EMPTY,
    getAccountsStartingWith: EMPTY,
  });
