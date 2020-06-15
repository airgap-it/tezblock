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
import { Operation } from '@tezblock/services/base.service'

describe('ApiService', () => {
  let service: ApiService
  let storeMock: MockStore<any>
  let httpMock: HttpTestingController
  const initialState = { app: appInitialState }
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const protocolVariablesServiceMock = getProtocolVariablesServiceMock()
  const rewardServiceMock = getRewardServiceMock()
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
        { provide: RewardService, useValue: rewardServiceMock }
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
    afterEach(() => {
      // We also run HttpTestingController#verify to make sure that there are no outstanding requests:
      httpMock.verify()
    })

    it('when Conseil return no transactions of given kind, then does not call getAccountsByIds', () => {
      spyOn(service, 'getAccountsByIds')

      service.getLatestTransactions(10, [OperationTypes.Transaction]).subscribe(transactions => {
        expect(transactions.length).toBe(0)
        expect(service.getAccountsByIds).not.toHaveBeenCalled()
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush([])
    })

    it('when Conseil return transactions other than Origination, then does not call getAccountsByIds', () => {
      const mockedTransactions = [{ kind: OperationTypes.Transaction }]

      spyOn(service, 'getAccountsByIds')

      service.getLatestTransactions(10, [OperationTypes.Transaction, OperationTypes.Origination]).subscribe(transactions => {
        expect(transactions.length).toBe(1)
        expect(service.getAccountsByIds).not.toHaveBeenCalled()
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

      spyOn(service, 'getAccountsByIds').and.returnValue(of(mockedOriginators))
      spyOn(service, 'addVoteData').and.callFake((transactions, kindList) => of(transactions))

      service.getLatestTransactions(10, kindList).subscribe(transactions => {
        expect(transactions).toEqual(<any>expectedTransactions)
        expect(service.getAccountsByIds).toHaveBeenCalledWith([fakeOriginatedContractName])
        expect(service.addVoteData).toHaveBeenCalledWith(<any>expectedTransactions, kindList)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })
  })

  describe('getTransactionsById', () => {
    it('calls getAccountsByIds with transaction of kind Delegation to set delegatedBalance', () => {
      const fakeSourceName = 'fakeSourceName'
      const mockedTransactions = [{ kind: OperationTypes.Transaction }, { kind: OperationTypes.Delegation, source: fakeSourceName }]
      const expectedTransactions = [
        { kind: OperationTypes.Transaction },
        { kind: OperationTypes.Delegation, source: fakeSourceName, delegatedBalance: 7 }
      ]
      const mockedDelegation = [{ account_id: fakeSourceName, balance: 7 }]

      spyOn(service, 'getAccountsByIds').and.returnValue(of(mockedDelegation))
      spyOn(service, 'addVoteData').and.callFake(transactions => of(transactions))

      service.getTransactionsById('fake_id', 10).subscribe(transactions => {
        expect(transactions).toEqual(<any>expectedTransactions)
        expect(service.getAccountsByIds).toHaveBeenCalledWith([fakeSourceName])
        expect(service.addVoteData).toHaveBeenCalledWith(<any>expectedTransactions)
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

      spyOn(service, 'getAccountsByIds').and.returnValue(of(mockedOriginations))
      spyOn(service, 'addVoteData').and.callFake(transactions => of(transactions))

      service.getTransactionsById('fake_id', 10).subscribe(transactions => {
        expect(transactions).toEqual(<any>expectedTransactions)
        expect(service.getAccountsByIds).toHaveBeenCalledWith([fakeOriginatedContractsName])
        expect(service.addVoteData).toHaveBeenCalledWith(<any>expectedTransactions)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })

    it('does not call getAccountsByIds when no transactions of kind Delegation or Origination', () => {
      const mockedTransactions = [{ kind: OperationTypes.Transaction }]

      spyOn(service, 'getAccountsByIds')
      spyOn(service, 'addVoteData').and.callFake(transactions => of(transactions))

      service.getTransactionsById('fake_id', 10).subscribe(transactions => {
        expect(transactions).toEqual(<any>mockedTransactions)
        expect(service.getAccountsByIds).not.toHaveBeenCalled()
        expect(service.addVoteData).toHaveBeenCalledWith(<any>mockedTransactions)
      })

      const req = httpMock.expectOne((<any>service).getUrl('operations'))
      expect(req.request.method).toBe('POST')
      req.flush(mockedTransactions)
    })
  })

  describe('addVoteData', () => {
    it('when kindList does not include "ballot" or "proposals" then no logic is used', () => {
      spyOn(service, 'getVotingPeriod')
      spyOn(service, 'getVotesForTransaction')
      const _mockedTransactions = mockedTransactions.map(transaction => ({ ...transaction, kind: OperationTypes.Transaction }))

      service.addVoteData(_mockedTransactions, [OperationTypes.Transaction]).subscribe(transactions => {
        expect(transactions).toEqual(_mockedTransactions)
        expect(service.getVotingPeriod).not.toHaveBeenCalled()
        expect(service.getVotesForTransaction).not.toHaveBeenCalled()
      })
    })

    describe('when kindList includes "ballot" or "proposals"', () => {
      let _mockedTransactions

      beforeEach(() => {
        _mockedTransactions = mockedTransactions.map(transaction => ({ ...transaction, block_level: 2 }))
        spyOn(service, 'getVotingPeriod').and.returnValue(
          of([
            {
              level: 2,
              period_kind: 'mocked_period_kind'
            }
          ])
        )
      })

      it('then getVotingPeriod is called only for transactions with distinct block_level', () => {
        spyOn(service, 'getVotesForTransaction').and.callFake(transaction => of(transaction.fee))

        service.addVoteData(_mockedTransactions, [OperationTypes.Ballot]).subscribe(transactions => {
          expect(transactions.length).toBe(2)
          
          expect(service.getVotingPeriod).toHaveBeenCalledWith([
            {
              field: 'level',
              operation: Operation.eq,
              set: ['2'],
              inverse: false,
              group: `A0`
            }
          ])  
        })
      })

      it('then sets voting_period and votes properties', () => {
        const getVotesForTransactionSpy = spyOn(service, 'getVotesForTransaction').and.callFake(transaction => of(transaction.fee))

        service.addVoteData(_mockedTransactions, [OperationTypes.Ballot]).subscribe(transactions => {
          expect(transactions.length).toBe(2)
          expect(transactions[0]).toEqual(
            jasmine.objectContaining({
              voting_period: 'mocked_period_kind',
              votes: 0
            })
          )
          expect(transactions[1]).toEqual(
            jasmine.objectContaining({
              voting_period: 'mocked_period_kind',
              votes: 1
            })
          )

          expect(getVotesForTransactionSpy.calls.all().length).toEqual(_mockedTransactions.length)
          expect(getVotesForTransactionSpy.calls.all()[0].args[0]).toEqual(_mockedTransactions[0])
          expect(getVotesForTransactionSpy.calls.all()[1].args[0]).toEqual(_mockedTransactions[1])
        })
      })
    })
  })
})
