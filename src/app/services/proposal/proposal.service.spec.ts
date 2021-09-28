import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { ProposalService } from './proposal.service';
import { Transaction } from '@tezblock/interfaces/Transaction';
import { Operation } from '@tezblock/services/base.service';
import { OperationTypes } from '@tezblock/domain/operations';

describe('ProposalService', () => {
  let service: ProposalService;
  let httpMock: HttpTestingController;
  const chainNetworkServiceMock = getChainNetworkServiceMock();
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
      totalRewards: '0',
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
      totalRewards: '1',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
      ],
    });

    service = TestBed.inject(ProposalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addVoteData', () => {
    it('when kindList does not include "ballot" or "proposals" then no logic is used', () => {
      spyOn(service, 'getVotingPeriod');
      spyOn(service, 'getVotesForTransaction');
      const _mockedTransactions = mockedTransactions.map((transaction) => ({
        ...transaction,
        kind: OperationTypes.Transaction,
      }));

      service
        .addVoteData(_mockedTransactions, [OperationTypes.Transaction])
        .subscribe((transactions) => {
          expect(transactions).toEqual(_mockedTransactions);
          expect(service.getVotingPeriod).not.toHaveBeenCalled();
          expect(service.getVotesForTransaction).not.toHaveBeenCalled();
        });
    });

    describe('when kindList includes "ballot" or "proposals"', () => {
      let _mockedTransactions;

      beforeEach(() => {
        _mockedTransactions = mockedTransactions.map((transaction) => ({
          ...transaction,
          block_level: 2,
        }));
        spyOn(service, 'getVotingPeriod').and.returnValue(
          of([
            {
              level: 2,
              period_kind: 'mocked_period_kind',
            },
          ])
        );
      });

      it('then getVotingPeriod is called only for transactions with distinct block_level', () => {
        spyOn(service, 'getVotesForTransaction').and.callFake((transaction) =>
          of(transaction.fee)
        );

        service
          .addVoteData(_mockedTransactions, [OperationTypes.Ballot])
          .subscribe((transactions) => {
            expect(transactions.length).toBe(2);

            expect(service.getVotingPeriod).toHaveBeenCalledWith([
              {
                field: 'level',
                operation: Operation.eq,
                set: ['2'],
                inverse: false,
                group: `A0`,
              },
            ]);
          });
      });

      it('then sets voting_period and votes properties', () => {
        const getVotesForTransactionSpy = spyOn(
          service,
          'getVotesForTransaction'
        ).and.callFake((transaction) => of(transaction.fee));

        service
          .addVoteData(_mockedTransactions, [OperationTypes.Ballot])
          .subscribe((transactions) => {
            expect(transactions.length).toBe(2);
            expect(transactions[0]).toEqual(
              jasmine.objectContaining({
                voting_period: 'mocked_period_kind',
                votes: 0,
              })
            );
            expect(transactions[1]).toEqual(
              jasmine.objectContaining({
                voting_period: 'mocked_period_kind',
                votes: 1,
              })
            );

            expect(getVotesForTransactionSpy.calls.all().length).toEqual(
              _mockedTransactions.length
            );
            expect(getVotesForTransactionSpy.calls.all()[0].args[0]).toEqual(
              _mockedTransactions[0]
            );
            expect(getVotesForTransactionSpy.calls.all()[1].args[0]).toEqual(
              _mockedTransactions[1]
            );
          });
      });
    });
  });
});
