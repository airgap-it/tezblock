import { TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

import { ApiService } from './api.service'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { ProtocolVariablesService } from '@tezblock/services/protocol-variables/protocol-variables.service'
import { getProtocolVariablesServiceMock } from '@tezblock/services/protocol-variables/protocol-variables.service.mock'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { getRewardServiceMock } from '@tezblock/services/reward/reward.service.mock'
import { OperationTypes } from '@tezblock/domain/operations'
import { of } from 'rxjs'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { ProposalService } from '@tezblock/services/proposal/proposal.service'
import { getProposalServiceMock } from '@tezblock/services/proposal/proposal.service.mock'
import { AccountService } from '@tezblock/services/account/account.service'
import { getAccountServiceMock } from '@tezblock/services/account/account.service.mock'

describe('ApiService', () => {
  let service: ApiService
  let storeMock: MockStore<any>
  let httpMock: HttpTestingController
  const initialState = { app: appInitialState }
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const protocolVariablesServiceMock = getProtocolVariablesServiceMock()
  const rewardServiceMock = getRewardServiceMock()
  const proposalServiceMock = getProposalServiceMock()
  const accountServiceMock = getAccountServiceMock()
  const mockedTransactions: Transaction[] = [
    {
      timestamp: 1,
      block_level: 1,
      operation_group_hash: 'operation_group_hash_0',
      amount: 0,
      delegate: 'delegate_0',
      block_hash: 'block_hash_0',
      operation_id: 0,
      slots: 'slots_0',
      kind: null,
      fee: 0,
      level: 0,
      stakingBalance: '0',
      bakingRewards: '0',
      endorsingRewards: '0',
      fees: '0',
      totalRewards: '0'
    },
    {
      timestamp: 2,
      block_level: 2,
      operation_group_hash: 'operation_group_hash_1',
      amount: 1,
      delegate: 'delegate_1',
      block_hash: 'block_hash_1',
      operation_id: 1,
      slots: 'slots_1',
      kind: null,
      fee: 1,
      level: 1,
      stakingBalance: '1',
      bakingRewards: '1',
      endorsingRewards: '1',
      fees: '1',
      totalRewards: '1'
    }
  ]

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: ProtocolVariablesService, useValue: protocolVariablesServiceMock },
        { provide: RewardService, useValue: rewardServiceMock },
        { provide: ProposalService, useValue: proposalServiceMock },
        { provide: AccountService, useValue: accountServiceMock }
      ]
    })

    service = TestBed.get(ApiService)
    storeMock = TestBed.get(MockStore)
    httpMock = TestBed.get(HttpTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getLatestTransactions', () => {
    beforeEach(() => {
      accountServiceMock.getAccountsByIds.calls.reset()
    })

    afterEach(() => {
      // We also run HttpTestingController#verify to make sure that there are no outstanding requests:
      httpMock.verify()
    })

    it('when Conseil return no transactions of given kind, then does not call getAccountsByIds', () => {
      service.getLatestTransactions(10, [OperationTypes.Transaction]).subscribe(transactions => {
        expect(transactions.length).toBe(0)
        expect(accountServiceMock.getAccountsByIds).not.toHaveBeenCalled()
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush([])
    })

    it('when Conseil return transactions other than Origination, then does not call getAccountsByIds', () => {
      const mockedTransactions = [{ kind: OperationTypes.Transaction }]

      service.getLatestTransactions(10, [OperationTypes.Transaction, OperationTypes.Origination]).subscribe(transactions => {
        expect(transactions.length).toBe(1)
        expect(accountServiceMock.getAccountsByIds).not.toHaveBeenCalled()
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })

    it('when Conseil return Origination transactions, then tries add originatedBalance', () => {
      const fakeOriginatedContractName = 'fakeOriginatedContractName'
      const mockedTransactions = [
        { kind: OperationTypes.Transaction, originated_contracts: null },
        { kind: OperationTypes.Origination, originated_contracts: fakeOriginatedContractName }
      ]
      const expectedTransactions = [
        { kind: OperationTypes.Transaction, originated_contracts: null },
        { kind: OperationTypes.Origination, originated_contracts: fakeOriginatedContractName, originatedBalance: 6 }
      ]
      const mockedOriginators = [{ account_id: fakeOriginatedContractName, balance: 6 }]
      const kindList = [OperationTypes.Transaction, OperationTypes.Origination]

      accountServiceMock.getAccountsByIds.and.returnValue(of(mockedOriginators))
      proposalServiceMock.addVoteData.and.callFake((transactions, kindList) => of(transactions))

      service.getLatestTransactions(10, kindList).subscribe(transactions => {
        expect(transactions).toEqual(<any>expectedTransactions)
        expect(accountServiceMock.getAccountsByIds).toHaveBeenCalledWith([fakeOriginatedContractName])
        expect(proposalServiceMock.addVoteData).toHaveBeenCalledWith(<any>expectedTransactions, kindList)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })
  })

  describe('getTransactionsById', () => {
    beforeEach(() => {
      accountServiceMock.getAccountsByIds.calls.reset()
    })

    it('calls getAccountsByIds with transaction of kind Delegation to set delegatedBalance', () => {
      const fakeSourceName = 'fakeSourceName'
      const mockedTransactions = [{ kind: OperationTypes.Transaction }, { kind: OperationTypes.Delegation, source: fakeSourceName }]
      const expectedTransactions = [
        { kind: OperationTypes.Transaction },
        { kind: OperationTypes.Delegation, source: fakeSourceName, delegatedBalance: 7 }
      ]
      const mockedDelegation = [{ account_id: fakeSourceName, balance: 7 }]

      accountServiceMock.getAccountsByIds.and.returnValue(of(mockedDelegation))
      proposalServiceMock.addVoteData.and.callFake(transactions => of(transactions))

      service.getTransactionsById('fake_id', 10).subscribe(transactions => {
        expect(transactions).toEqual(<any>expectedTransactions)
        expect(accountServiceMock.getAccountsByIds).toHaveBeenCalledWith([fakeSourceName])
        expect(proposalServiceMock.addVoteData).toHaveBeenCalledWith(<any>expectedTransactions)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })

    it('calls getAccountsByIds with transaction of kind Origination to set originatedBalance', () => {
      const fakeOriginatedContractsName = 'fakeOriginatedContractsName'
      const mockedTransactions = [
        { kind: OperationTypes.Transaction },
        { kind: OperationTypes.Origination, originated_contracts: fakeOriginatedContractsName }
      ]
      const expectedTransactions = [
        { kind: OperationTypes.Transaction },
        { kind: OperationTypes.Origination, originated_contracts: fakeOriginatedContractsName, originatedBalance: 8 }
      ]
      const mockedOriginations = [{ account_id: fakeOriginatedContractsName, balance: 8 }]

      accountServiceMock.getAccountsByIds.and.returnValue(of(mockedOriginations))
      proposalServiceMock.addVoteData.and.callFake(transactions => of(transactions))

      service.getTransactionsById('fake_id', 10).subscribe(transactions => {
        expect(transactions).toEqual(<any>expectedTransactions)
        expect(accountServiceMock.getAccountsByIds).toHaveBeenCalledWith([fakeOriginatedContractsName])
        expect(proposalServiceMock.addVoteData).toHaveBeenCalledWith(<any>expectedTransactions)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })

    it('does not call getAccountsByIds when no transactions of kind Delegation or Origination', () => {
      const mockedTransactions = [{ kind: OperationTypes.Transaction }]

      proposalServiceMock.addVoteData.and.callFake(transactions => of(transactions))

      service.getTransactionsById('fake_id', 10).subscribe(transactions => {
        expect(transactions).toEqual(<any>mockedTransactions)
        expect(accountServiceMock.getAccountsByIds).not.toHaveBeenCalled()
        expect(proposalServiceMock.addVoteData).toHaveBeenCalledWith(<any>mockedTransactions)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })
  })
})
