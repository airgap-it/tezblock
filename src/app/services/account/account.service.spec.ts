import { TestBed } from '@angular/core/testing'

import { AccountService } from './account.service'

xdescribe('AccountService', () => {
  let service: AccountService

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [] })

    service = TestBed.get(AccountService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  xdescribe('getDelegatedAccounts', () => {

  })
})
