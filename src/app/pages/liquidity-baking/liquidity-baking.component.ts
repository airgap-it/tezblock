import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import * as fromRoot from '@tezblock/reducers';
import * as actions from './actions';
import * as appActions from '../../app.actions';
import { map } from 'rxjs/operators';
import { Title, Meta } from '@angular/platform-browser';
import {
  CryptoPriceApiResponse,
  PricePeriod,
} from '@tezblock/services/crypto-prices/crypto-prices.service';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { AbstractCurrency } from '@tezblock/components/swap/swap-utils';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { AccountInfo } from '@airgap/beacon-sdk';
import BigNumber from 'bignumber.js';
import { getConnectedWallet } from '@tezblock/app.selectors';
import { TezosCurrency } from '@tezblock/components/swap/TezosCurrency';
import { TokenizedBitcoinCurrency } from '@tezblock/components/swap/TokenizedBitcoinCurrency';
import { Tab } from '@tezblock/domain/tab';
import { defaultOptions } from '@tezblock/components/chart-item/chart-item.component';
import { ChartOptions } from 'chart.js';
import { ApiService } from '@tezblock/services/api/api.service';
import { getPrecision } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component';
import { LiquidityBaseComponent } from '@tezblock/components/liquidity-base/liquidity-base.component';

const liquidityChartOptions = (currency: AbstractCurrency): ChartOptions => {
  return {
    ...defaultOptions,
    scales: {
      ...defaultOptions.scales,
      yAxes: [
        {
          display: true,
          gridLines: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 6,
          },
        },
      ],
    },
    tooltips: {
      ...defaultOptions.tooltips,
      callbacks: {
        ...defaultOptions.tooltips.callbacks,
        label: function (data, _labels): string {
          let value = parseFloat(data.value).toFixed(2);
          return `${value} ${currency.chartSymbol}`;
        },
      },
    },
  };
};
export enum MainTab {
  SWAP = 'SWAP',
  LIQUIDITY = 'LIQUIDITY',
}

export enum NestedTab {
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
}
@Component({
  selector: 'app-liquidity-baking',
  templateUrl: './liquidity-baking.component.html',
  styleUrls: ['./liquidity-baking.component.scss'],
})
export class LiquidityBakingComponent
  extends LiquidityBaseComponent
  implements OnInit
{
  private _tabs: Tab[] | undefined = [];
  selectedTab: Tab | undefined = undefined;

  public connectedWallet$: Observable<AccountInfo | undefined>;

  public availableBalanceFrom$: Observable<BigNumber | undefined> =
    new Observable();

  public availableBalanceTo$: Observable<BigNumber | undefined> =
    new Observable();
  public priceChartLabels$: Observable<string[]>;
  public priceChartDatasets$: Observable<{ data: number[]; label: string }[]>;

  public chartData$: Observable<CryptoPriceApiResponse[]>;
  public priceDelta$: Observable<string>;
  public pricePeriod$ = new BehaviorSubject<number>(PricePeriod.day);
  public totalValueLocked$: Observable<string>;
  public estimatedApy$: Observable<string>;

  public slippage: number = this.slippages[0];
  public chartOptions;
  public mainTab: MainTab = MainTab.SWAP;
  public nestedTab: NestedTab = NestedTab.ADD_LIQUIDITY;
  public accountInfo: string | undefined;
  public marketPrice$: Observable<string> | undefined;
  public fromCurrency: AbstractCurrency | undefined;
  public toCurrency: AbstractCurrency | undefined;
  public tezCurrency: AbstractCurrency | undefined;
  public tokenCurrency: AbstractCurrency | undefined;
  public tezBalance$: Observable<BigNumber | undefined> = new Observable();
  public tokenBalance$: Observable<BigNumber | undefined> = new Observable();

  getPrecision = getPrecision;
  public currencyInfo = {
    symbol: '$',
    currency: '$',
    price: new BigNumber(1),
  };

  get tabs() {
    return this._tabs || [];
  }

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly apiService: ApiService,
    private titleService: Title,
    private metaTagService: Meta
  ) {
    super(store$);
    this.store$.dispatch(appActions.setupBeacon());
    this.fromCurrency = new TezosCurrency(this.store$);
    this.tezCurrency = this.fromCurrency;
    this.toCurrency = new TokenizedBitcoinCurrency(
      this.store$,
      this.chainNetworkService,
      this.apiService
    );
    this.tokenCurrency = this.toCurrency;
  }

  async ngOnInit() {
    this.totalValueLocked$ = this.tokenCurrency.getTotalValueLocked();
    this.estimatedApy$ = this.tokenCurrency.estimateApy();
    if (!this.selectedTab) {
      this.updateSelectedTab(this.tabs[0]);
    }
    this.connectedWallet$ = this.store$.select(getConnectedWallet);

    this.availableBalanceFrom$ = this.fromCurrency.getBalance();
    this.availableBalanceTo$ = this.toCurrency.getBalance();

    this.tezBalance$ = this.availableBalanceFrom$;
    this.tokenBalance$ = this.availableBalanceTo$;

    this.priceDelta$ = this.store$.select(
      (state) => state.liquidityBaking.priceDelta
    );
    this.loadChartData();
    this.calculatePriceDelta();

    this.chartData$ = this.store$.select(
      (state) => state.liquidityBaking.chartData
    );

    this.priceChartDatasets$ = this.chartData$.pipe(
      map((data) => [
        { data: data?.map((dataItem) => dataItem[1]), label: 'Price' },
      ])
    );

    this.marketPrice$ = this.chartData$.pipe(
      map((data) => {
        const value =
          data && data.length
            ? new BigNumber(data[data.length - 1][1])
            : undefined;
        const integerValueLength = value?.integerValue().toString().length;
        return value
          ?.toFormat(this.fromCurrency.decimals - integerValueLength)
          .replace(/\.?0+$/, '');
      })
    );

    this.priceChartLabels$ = this.chartData$.pipe(
      map((data) =>
        data?.map((dataItem) => new Date(dataItem[0]).toLocaleDateString())
      )
    );

    this.titleService.setTitle(`Liquidity Baking - tezblock`);
    this.metaTagService.updateTag({
      name: 'description',
      content: `Liquidity Baking`,
    });
  }

  loadChartData() {
    this.chartOptions = liquidityChartOptions(this.fromCurrency);
    this.store$.dispatch(
      actions.loadChartData({
        from: this.fromCurrency.symbol,
        to: this.toCurrency.symbol,
      })
    );
  }

  calculatePriceDelta() {
    this.store$.dispatch(
      actions.calculatePriceDelta({
        symbol: this.toCurrency.symbol,
        referenceSymbol: this.toCurrency.referenceSymbol,
      })
    );
  }

  selectTab(tab: TabDirective, mainTab: boolean = true) {
    if (mainTab) {
      this.mainTab = tab.id as MainTab;
    } else {
      this.nestedTab = tab.id as NestedTab;
    }
  }

  swapDirection() {
    const [tempFromCurrency, tempAvailableBalanceFrom] = [
      this.fromCurrency,
      this.availableBalanceFrom$,
    ];
    this.fromCurrency = this.toCurrency;
    this.availableBalanceFrom$ = this.availableBalanceTo$;
    this.toCurrency = tempFromCurrency;
    this.availableBalanceTo$ = tempAvailableBalanceFrom;
    this.loadChartData();
  }

  private updateSelectedTab(selectedTab: Tab) {
    this.tabs.forEach((tab) => (tab.active = tab === selectedTab));
    this.selectedTab = selectedTab;
  }

  updateSlippage(slippage: number) {
    this.slippage = slippage;
  }

  setMinimumReceived$(value: BigNumber | undefined) {
    this.minimumReceived$.next(value);
  }
}
