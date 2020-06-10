import { of } from 'rxjs'

export const getAccountServiceMock = () => jasmine.createSpyObj('AccountService', {
    getDelegatedAccounts: of(null),
    getAccountStatus: of(null)
})
