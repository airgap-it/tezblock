import BigNumber from 'bignumber.js';
import { from, Observable } from 'rxjs';
import * as fromRoot from '@tezblock/reducers';
import { Store } from '@ngrx/store';
import { getConnectedWallet } from '@tezblock/app.selectors';
import { TezosBTC } from '@airgap/coinlib-core';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { map, mergeMap, retry, switchMap } from 'rxjs/operators';
import * as liquidityBakingCalculations from '../../services/liquidity-baking/liquidity-baking-calculations';
import { AbstractCurrency, tezToMutez } from './swap-utils';
import { PartialTezosOperation } from '@airgap/beacon-sdk';
import {
  ContractAbstraction,
  ContractProvider,
  TezosToolkit,
} from '@taquito/taquito';
import * as cryptocompare from 'cryptocompare';
import { ApiService } from '@tezblock/services/api/api.service';

export class TokenizedBitcoinCurrency implements AbstractCurrency {
  public symbol = 'tzBTC';
  public chartSymbol = this.symbol;
  public liquidityTokenSymbol = 'LB Token';

  public decimals = 8;
  public imgUrl =
    '/submodules/tezos_assets/imgs/KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn.png';

  private tezosToolKit: TezosToolkit | undefined;
  private liquidityTokenContractAddress =
    'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo';
  private liquidityBakingContractAddress =
    'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5';
  private tokenContractAddress = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';

  private liquidityTokenContract: ContractAbstraction<ContractProvider>;
  private liquidityBakingContract: ContractAbstraction<ContractProvider>;
  private tokenContract: ContractAbstraction<ContractProvider>;
  private tokenPool: number;
  private xtzPool: number;
  private lqtTotal: number;

  constructor(
    protected store$: Store<fromRoot.State>,
    protected chainNetworkService: ChainNetworkService,
    protected apiService: ApiService
  ) {}

  async initContracts() {
    if (
      this.tezosToolKit &&
      this.liquidityBakingContract &&
      this.liquidityTokenContract &&
      this.tokenContract
    ) {
      return;
    }
    try {
      const environment = this.chainNetworkService.getEnvironment();
      this.tezosToolKit = new TezosToolkit(environment.rpcUrl);

      this.liquidityBakingContract = await this.tezosToolKit.contract.at(
        this.liquidityBakingContractAddress
      );
      this.liquidityTokenContract = await this.tezosToolKit.contract.at(
        this.liquidityTokenContractAddress
      );
      this.liquidityBakingContract = await this.tezosToolKit.contract.at(
        this.liquidityBakingContractAddress
      );
      this.tokenContract = await this.tezosToolKit.contract.at(
        this.tokenContractAddress
      );

      this.tokenPool = new BigNumber(
        this.liquidityBakingContract.script.storage[0].int
      ).toNumber();
      this.xtzPool = new BigNumber(
        this.liquidityBakingContract.script.storage[1].int
      ).toNumber();
      this.lqtTotal = new BigNumber(
        this.liquidityBakingContract.script.storage[2].int
      ).toNumber();
    } catch (error) {
      throw error;
    }
  }

  getBalance() {
    const protocol = new TezosBTC();
    return this.store$.select(getConnectedWallet).pipe(
      switchMap((accountInfo) => {
        return accountInfo
          ? from(protocol.getBalanceOfAddresses([accountInfo.address])).pipe(
              map((balance) =>
                new BigNumber(balance).shiftedBy(-1 * this.decimals)
              )
            )
          : from([new BigNumber(0)]);
      })
    );
  }

  async getExpectedMinimumReceivedToken(
    mutezAmount: BigNumber
  ): Promise<BigNumber> {
    await this.initContracts();

    const num = this.xtzToTokenTokenOutput(mutezAmount.toNumber());
    return new BigNumber(num).shiftedBy(-1 * this.decimals);
  }

  async getExpectedMinimumReceivedTez(tokenAmount: number): Promise<BigNumber> {
    await this.initContracts();
    return new BigNumber(this.tokenToXtzXtzOutput(tokenAmount));
  }

  async fromTez(
    address: string,
    amount: BigNumber,
    expectedTokenAmount: number
  ): Promise<PartialTezosOperation[]> {
    await this.initContracts();

    return this.generateXtzToTokenSwapOperation(
      address,
      tezToMutez(amount, 6),
      expectedTokenAmount
    );
  }

  async addLiquidity(
    mutezAmount: number,
    address: string,
    minLqtMinted: number,
    maxTokenDeposited: number
  ): Promise<PartialTezosOperation[]> {
    await this.initContracts();
    return this.generateAddLiquidityOperation(
      mutezAmount,
      address,
      minLqtMinted,
      maxTokenDeposited
    );
  }

  async addLiquidityManually(
    address: string,
    minLqtMinted: number,
    tokenAmount: number
  ): Promise<PartialTezosOperation[]> {
    await this.initContracts();
    return this.generateAddLiquidityManuallyOperation(
      address,
      minLqtMinted,
      tokenAmount
    );
  }

  async removeLiquidity(
    liquidityAmount: number,
    address: string
  ): Promise<PartialTezosOperation[]> {
    await this.initContracts();
    return this.generateRemoveLiquidityOperation(liquidityAmount, address);
  }

  async toTez(
    address: string,
    amount: BigNumber,
    minReceived: number
  ): Promise<PartialTezosOperation[]> {
    return this.generateTokenToXtzSwapOperation(
      address,
      amount.shiftedBy(this.decimals).toNumber(),
      minReceived
    );
  }

  generateTokenToXtzSwapOperation(
    address: string,
    tokenAmount: number,
    minReceived: number
  ): PartialTezosOperation[] {
    const deadline = new BigNumber(Date.now())
      .dividedToIntegerBy(1000)
      .plus(60 * 60)
      .toString();

    let approveParams = this.tokenContract.methods
      .approve(this.liquidityBakingContractAddress, tokenAmount)
      .toTransferParams();

    let tokenToXtzParams = this.liquidityBakingContract.methods
      .tokenToXtz(address, tokenAmount, minReceived, deadline)
      .toTransferParams();

    return [
      {
        kind: 'transaction',
        source: address,
        amount: '0',
        destination: this.tokenContractAddress,
        parameters: approveParams.parameter,
      },
      {
        kind: 'transaction',
        source: address,
        amount: '0',
        destination: this.liquidityBakingContractAddress,
        parameters: tokenToXtzParams.parameter,
      },
    ] as PartialTezosOperation[];
  }

  generateXtzToTokenSwapOperation(
    address: string,
    mutezAmount: number,
    expectedTokenAmount: number
  ): PartialTezosOperation[] {
    const deadline = new BigNumber(Date.now())
      .dividedToIntegerBy(1000)
      .plus(60 * 60)
      .toString();

    let xtzToTokenParams = this.liquidityBakingContract.methods
      .xtzToToken(address, expectedTokenAmount, deadline)
      .toTransferParams();

    return [
      {
        kind: 'transaction',
        source: address,
        amount: new BigNumber(mutezAmount).toString(),
        destination: this.liquidityBakingContractAddress,
        parameters: xtzToTokenParams.parameter,
      },
    ] as PartialTezosOperation[];
  }

  generateAddLiquidityManuallyOperation(
    address: string,
    minLqtMinted: number,
    maxTokenDeposited: number
  ) {
    const deadline = new BigNumber(Date.now())
      .dividedToIntegerBy(1000)
      .plus(60 * 60)
      .toString();

    const addLiquidityXtzIn = new BigNumber(
      liquidityBakingCalculations.addLiquidityXtzIn(
        maxTokenDeposited,
        this.xtzPool,
        this.tokenPool
      )
    ).toString();

    let approveZeroParams = this.tokenContract.methods
      .approve(this.liquidityBakingContractAddress, 0)
      .toTransferParams();

    let approveParams = this.tokenContract.methods
      .approve(this.liquidityBakingContractAddress, maxTokenDeposited)
      .toTransferParams();

    let addLiquidityParams = this.liquidityBakingContract.methods
      .addLiquidity(address, minLqtMinted, maxTokenDeposited, deadline)
      .toTransferParams();

    const approveZeroRequest = {
      kind: 'transaction',
      source: address,
      amount: '0',
      destination: this.tokenContractAddress,
      parameters: approveZeroParams.parameter,
    } as PartialTezosOperation;

    const approveRequest = {
      kind: 'transaction',
      source: address,
      amount: '0',
      destination: this.tokenContractAddress,
      parameters: approveParams.parameter,
    } as PartialTezosOperation;

    const addLiquidityRequest = {
      kind: 'transaction',
      source: address,
      amount: new BigNumber(addLiquidityXtzIn).toString(),
      destination: this.liquidityBakingContractAddress,
      parameters: addLiquidityParams.parameter,
    } as PartialTezosOperation;
    return [
      approveZeroRequest,
      approveRequest,
      addLiquidityRequest,
      approveZeroRequest,
    ];
  }

  generateAddLiquidityOperation(
    xtzAmountToBeSwapped: number,
    address: string,
    minLqtMinted: number,
    maxTokenDeposited: number
  ) {
    const deadline = new BigNumber(Date.now())
      .dividedToIntegerBy(1000)
      .plus(60 * 60)
      .toString();

    const addLiquidityXtzIn = new BigNumber(
      liquidityBakingCalculations.addLiquidityXtzIn(
        maxTokenDeposited,
        this.xtzPool,
        this.tokenPool
      )
    ).toString();

    let xtzToTokenParams = this.liquidityBakingContract.methods
      .xtzToToken(address, 0, deadline)
      .toTransferParams();

    let approveParams = this.tokenContract.methods
      .approve(this.liquidityBakingContractAddress, maxTokenDeposited)
      .toTransferParams();

    let addLiquidityParams = this.liquidityBakingContract.methods
      .addLiquidity(address, minLqtMinted, maxTokenDeposited, deadline)
      .toTransferParams();

    const xtzToTokenRequest = {
      kind: 'transaction',
      source: address,
      amount: new BigNumber(xtzAmountToBeSwapped).toString(),
      destination: this.liquidityBakingContractAddress,
      parameters: xtzToTokenParams.parameter,
    } as PartialTezosOperation;

    const approveRequest = {
      kind: 'transaction',
      source: address,
      amount: '0',
      destination: this.tokenContractAddress,
      parameters: approveParams.parameter,
    } as PartialTezosOperation;

    const addLiquidityRequest = {
      kind: 'transaction',
      source: address,
      amount: new BigNumber(addLiquidityXtzIn).toString(),
      destination: this.liquidityBakingContractAddress,
      parameters: addLiquidityParams.parameter,
    } as PartialTezosOperation;
    return [xtzToTokenRequest, approveRequest, addLiquidityRequest];
  }

  generateRemoveLiquidityOperation(liquidityAmount: number, address: string) {
    const deadline = new BigNumber(Date.now())
      .dividedToIntegerBy(1000)
      .plus(60 * 60)
      .toString();

    const minXtzWithdrawn = liquidityBakingCalculations.removeLiquidityXtzOut(
      liquidityAmount,
      this.lqtTotal,
      this.xtzPool
    );
    const minTokensWithdrawn =
      liquidityBakingCalculations.removeLiquidityTokenOut(
        liquidityAmount,
        this.lqtTotal,
        this.tokenPool
      );

    let removeLiquidityParams = this.liquidityBakingContract.methods
      .removeLiquidity(
        address,
        liquidityAmount,
        minXtzWithdrawn,
        minTokensWithdrawn,
        deadline
      )
      .toTransferParams();

    const removeLiquidityRequest = {
      kind: 'transaction',
      source: address,
      amount: '0',
      destination: this.liquidityBakingContractAddress,
      parameters: removeLiquidityParams.parameter,
    } as PartialTezosOperation;

    return [removeLiquidityRequest];
  }

  xtzToTokenTokenOutput(mutezAmount: number) {
    return liquidityBakingCalculations.xtzToTokenTokenOutput(
      mutezAmount,
      this.xtzPool,
      this.tokenPool
    );
  }

  tokenToXtzXtzOutput(tokenAmount: number) {
    return liquidityBakingCalculations.tokenToXtzXtzOutput(
      tokenAmount,
      this.xtzPool,
      this.tokenPool
    );
  }

  async getAvailableLiquidityBalance(address: string): Promise<BigNumber> {
    await this.initContracts();
    const storage: any = await this.liquidityTokenContract.storage();
    return (await storage.tokens.get(address)) ?? new BigNumber(0);
  }

  async getLiquidityBurnXtzOut(lqtBurned: number): Promise<BigNumber> {
    await this.initContracts();

    return new BigNumber(
      liquidityBakingCalculations.removeLiquidityXtzOut(
        lqtBurned,
        this.lqtTotal,
        this.xtzPool
      )
    );
  }

  async getLiquidityBurnTokensOut(lqtBurned: number): Promise<BigNumber> {
    await this.initContracts();

    return new BigNumber(
      liquidityBakingCalculations.removeLiquidityTokenOut(
        lqtBurned,
        this.lqtTotal,
        this.tokenPool
      )
    );
  }

  async estimateLiquidityCreated(mutezAmount: BigNumber): Promise<BigNumber> {
    await this.initContracts();
    return new BigNumber(
      liquidityBakingCalculations.addLiquidityLiquidityCreated(
        mutezAmount.toNumber(),
        this.xtzPool,
        this.lqtTotal
      )
    );
  }

  estimateTokenIn(mutezAmount: number) {
    return liquidityBakingCalculations.addLiquidityTokenIn(
      mutezAmount,
      this.xtzPool,
      this.tokenPool
    );
  }

  estimateXtzIn(tokenAmount: number) {
    return liquidityBakingCalculations.addLiquidityXtzIn(
      tokenAmount,
      this.xtzPool,
      this.tokenPool
    );
  }

  getTotalValueLocked(): Observable<string> {
    return from(cryptocompare.price('XTZ', ['USD'])).pipe(
      mergeMap((result) => {
        return this.apiService
          .getContractBalance(this.liquidityBakingContractAddress)
          .pipe(
            map((balance) => {
              return `${new BigNumber(balance)
                .times((result as any).USD)
                .times(2)
                .toFixed(2)} `;
            })
          );
      })
    );
  }

  estimateApy(): Observable<string> {
    const annualTezSubsidy = 2.5 * 2 * 60 * 24 * 365; // assuming blocktime of 30sec
    return this.apiService
      .getContractBalance(this.liquidityBakingContractAddress)
      .pipe(
        map((balance) => {
          const currentlyLockedTez = new BigNumber(balance).shiftedBy(-6);
          return `${currentlyLockedTez
            .plus(annualTezSubsidy)
            .div(currentlyLockedTez)
            .minus(1)
            .dividedBy(2) // account for half the value being locked in tzBTC
            .times(100)
            .toFixed(2)}%`;
        })
      );
  }
}
