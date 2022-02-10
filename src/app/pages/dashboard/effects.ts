import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, forkJoin } from 'rxjs';
import {
  map,
  catchError,
  switchMap,
  withLatestFrom,
  filter,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as actions from './actions';
import { BaseService } from '@tezblock/services/base.service';
import { ApiService } from '@tezblock/services/api/api.service';
import * as fromRoot from '@tezblock/reducers';
import { getTokenContracts } from '@tezblock/domain/contract';
import { first, get } from '@tezblock/services/fp';
import { getPeriodTimespanQuery } from '@tezblock/domain/vote';
import { BlockService } from '@tezblock/services/blocks/blocks.service';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { ContractService } from '@tezblock/services/contract/contract.service';
import { ProposalService } from '@tezblock/services/proposal/proposal.service';

@Injectable()
export class DashboarEffects {
  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContracts),
      switchMap(() => {
        const contracts = getTokenContracts(
          this.chainNetworkService.getNetwork(),
          6
        );
        if (!contracts || contracts.total === 0) {
          return of(actions.loadContractsSucceeded({ contracts: [] }));
        }

        return forkJoin(
          contracts.data.map((contract) =>
            this.contractService.getTotalSupplyByContract(contract)
          )
        ).pipe(
          map((totalSupplies) =>
            actions.loadContractsSucceeded({
              contracts: totalSupplies.map((totalSupply, index) => ({
                ...contracts.data[index],
                totalSupply,
              })),
            })
          ),
          catchError((error) => of(actions.loadContractsFailed({ error })))
        );
      })
    )
  );

  loadLatestProposal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestProposal),
      switchMap(() => {
        return this.apiService.getProposals(1).pipe(
          map(first),
          map((proposal) => actions.loadLatestProposalSucceeded({ proposal })),
          catchError((error) => of(actions.loadLatestProposalFailed({ error })))
        );
      })
    )
  );

  loadCurrentPeriodTimespan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCurrentPeriodTimespan),
      withLatestFrom(
        this.store$.select((state) => state.app.currentVotingPeriod),
        this.store$.select((state) => state.app.blocksPerVotingPeriod),
        this.store$.select(
          (state) => state.app.protocolVariables?.minimal_block_delay
        )
      ),
      filter(([, , , timeBetweenBlocks]) => timeBetweenBlocks !== undefined),
      map(
        ([
          ,
          currentVotingPeriod,
          blocksPerVotingPeriod,
          timeBetweenBlocks,
        ]) => ({
          currentVotingPeriod,
          blocksPerVotingPeriod,
          timeBetweenBlocks: Number(timeBetweenBlocks),
        })
      ),
      switchMap(
        ({ currentVotingPeriod, blocksPerVotingPeriod, timeBetweenBlocks }) =>
          this.baseService
            .post<{ timestamp: number }[]>(
              'blocks',
              getPeriodTimespanQuery(currentVotingPeriod, 'asc')
            )
            .pipe(map(first), map(get((item) => item.timestamp)))
            .pipe(
              map((response) =>
                actions.loadCurrentPeriodTimespanSucceeded({
                  currentPeriodTimespan: { start: response, end: null },
                  blocksPerVotingPeriod,
                  timeBetweenBlocks,
                })
              ),
              catchError((error) =>
                of(actions.loadCurrentPeriodTimespanFailed({ error }))
              )
            )
      )
    )
  );

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactions),
      switchMap(() => {
        return this.apiService.getLatestTransactions(5, ['transaction']).pipe(
          map((transactions) =>
            actions.loadTransactionsSucceeded({ transactions })
          ),
          catchError((error) => of(actions.loadTransactionsFailed({ error })))
        );
      })
    )
  );

  loadBlocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlocks),
      switchMap(() =>
        this.blockService.getLatestBlocks(5, ['volume', 'txcount']).pipe(
          map((blocks) => actions.loadBlocksSucceeded({ blocks })),
          catchError((error) => of(actions.loadBlocksFailed({ error })))
        )
      )
    )
  );

  loadCryptoHistoricData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCryptoHistoricData),
      switchMap(({ periodIndex }) =>
        this.cryptoPricesService
          .getHistoricCryptoPrices(new Date(), 'USD', 'XTZ', periodIndex)
          .pipe(
            map((cryptoHistoricData) =>
              actions.loadCryptoHistoricDataSucceeded({ cryptoHistoricData })
            ),
            catchError((error) =>
              of(actions.loadCryptoHistoricDataFailed({ error }))
            )
          )
      )
    )
  );

  loadDivisionOfVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadDivisionOfVotes),
      withLatestFrom(
        this.store$.select((state) => state.app.currentVotingPeriod)
      ),
      switchMap(([action, votingPeriod]) =>
        this.proposalService.getDivisionOfVotes({ votingPeriod }).pipe(
          map((divisionOfVotes) =>
            actions.loadDivisionOfVotesSucceeded({ divisionOfVotes })
          ),
          catchError((error) =>
            of(actions.loadDivisionOfVotesFailed({ error }))
          )
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly blockService: BlockService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly contractService: ContractService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly proposalService: ProposalService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
